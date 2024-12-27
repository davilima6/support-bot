export type BotConfig = {
  aiModel: string;
  allowedUserIds: string[];
  channelId: string;
};

export const defaultConfig: BotConfig = {
  aiModel: 'claude-3.5',
  allowedUserIds: [],
  channelId: process.env.SLACK_CHANNEL_ID || '',
};
