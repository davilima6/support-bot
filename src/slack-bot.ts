import { App, LogLevel } from '@slack/bolt';
import { WebClient } from '@slack/web-api';

import { BotConfig, CHANNEL_HISTORY_LIMIT, DEFAULT_CONFIG, DEFAULT_PORT } from './config';
import { answerQuestion, processMessages } from './services/ai/workflows';
import { CacheServiceFactory } from './services/cache/cache';
import { SettingsModal } from './views/settings-modal';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
});

const client = new WebClient(process.env.SLACK_BOT_TOKEN);

// Store config in memory
let botConfig: BotConfig = DEFAULT_CONFIG;

// Handle /configure-ai-bot command by opening configuration modal
app.command('/configure-ai-bot', async ({ ack, body, client }) => {
  await ack();

  const configModal = new SettingsModal(botConfig);

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: configModal.getView(),
    });
  } catch (error) {
    console.error('Error opening configuration modal:', error);
  }
});

// Handle configuration modal submission by updating bot settings
app.view('config_modal_submit', async ({ ack, body: _, view }) => {
  await ack();

  const newConfig = SettingsModal.parseSubmission(view);

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

  if (!('text' in message)) {
    return;
  }

  const cacheService = CacheServiceFactory.create(botConfig.cacheMode);
  let contextMessages: string = '';

  contextMessages = (await cacheService.get(botConfig.channelId)) || '';

  if (!contextMessages) {
    /** @see https://api.slack.com/methods/conversations.history */
    const channelHistory = await client.conversations.history({
      channel: botConfig.channelId,
      limit: CHANNEL_HISTORY_LIMIT,
    });

    contextMessages = processMessages(channelHistory.messages, botConfig.allowedUserIds ?? []);
    await cacheService.set(botConfig.channelId, contextMessages);
  }

  const answer = await answerQuestion(message.text as string, contextMessages, botConfig.aiModel);

  if (answer) {
    await say(answer);
  }
});

(async () => {
  const port = process.env.PORT || DEFAULT_PORT;

  await app.start(port);
  console.info(`⚡️ SupportBot is running at port ${port})`);
})();
