import { App, LogLevel } from '@slack/bolt';
import { WebClient } from '@slack/web-api';

import { answerQuestion, processMessages } from './ai-workflows';
import { BotConfig, defaultConfig } from './config';
import { ConfigModal } from './config-modal';

const DEFAULT_APP_PORT = 3_000;

/** Maximum of 999 */
const CHANNEL_HISTORY_LIMIT = 999;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
});

const webClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// Store bot configuration in memory
let botConfig: BotConfig = defaultConfig;

// Handle /configure-ai-bot command by opening configuration modal
app.command('/configure-ai-bot', async ({ ack, body, client }) => {
  await ack();

  const configModal = new ConfigModal(botConfig);

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: configModal.getView(),
    });
  } catch (error) {
    console.error('Error opening configuration modal:', error);
  }
});

// Process configuration modal submission and update bot settings
app.view('config_modal_submit', async ({ ack, body: _, view }) => {
  await ack();

  const newConfig = ConfigModal.parseSubmission(view);

  botConfig = { ...botConfig, ...newConfig };
  console.info('Update support bot configuration:', botConfig);
});

// Listen for messages and respond with AI
app.message(async ({ message, say }) => {
  if (message.channel !== botConfig.channelId) {
    return;
  }

  if (message.subtype === 'bot_message') {
    return;
  }

  /** @see https://api.slack.com/methods/conversations.history */
  const channelHistory = await webClient.conversations.history({
    channel: botConfig.channelId,
    limit: CHANNEL_HISTORY_LIMIT,
  });

  const contextMessages = processMessages(channelHistory.messages, botConfig.allowedUserIds ?? []);
  const answer = await answerQuestion(message.text as string, contextMessages, botConfig.aiModel);

  if (answer) {
    await say(answer);
  }
});

(async () => {
  const port = process.env.PORT || DEFAULT_APP_PORT;

  await app.start(port);
  console.log(`⚡️ SupportBot is running! (port ${port})`);
})();
