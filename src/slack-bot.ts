import { App, LogLevel, BlockAction } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { processMessages, answerQuestion } from './ai-workflow';
import { ConfigModal } from './config-modal';
import { BotConfig, defaultConfig } from './types';

// Initialize the Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
});

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

let botConfig: BotConfig = defaultConfig;

// Command to open the configuration modal
app.command('/configure-ai-bot', async ({ ack, body, client }) => {
  await ack();
  const configModal = new ConfigModal(botConfig);
  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: configModal.getView(),
    });
  } catch (error) {
    console.error('Error opening modal:', error);
  }
});

// Handle modal submission
app.view('config_modal_submit', async ({ ack, body, view }) => {
  await ack();
  const newConfig = ConfigModal.parseSubmission(view);
  botConfig = { ...botConfig, ...newConfig };
  console.log('Updated bot configuration:', botConfig);
});

// Listen for messages in the specified channel
app.message(async ({ message, say }) => {
  if (message.channel !== botConfig.channelId) return;
  if (message.subtype === 'bot_message') return;

  const channelHistory = await web.conversations.history({
    channel: botConfig.channelId,
    limit: 100,
  });

  const contextMessages = processMessages(channelHistory.messages, botConfig.supportTeamUserIds);
  const answer = await answerQuestion(message.text, contextMessages, botConfig.aiModel);

  if (answer) {
    await say(answer);
  }
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();

