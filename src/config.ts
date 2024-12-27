export type CacheMode = 'default' | 'no-cache';

export type BotConfig = {
  aiModel: string;
  allowedUserIds: string[];
  channelId: string;
  cacheMode: CacheMode;
};

export const DEFAULT_PORT = 3_000;

/** Maximum of 999 */
export const CHANNEL_HISTORY_LIMIT = 999;

export const DEFAULT_CONFIG: BotConfig = {
  aiModel: 'claude-3.5',
  allowedUserIds: [],
  channelId: process.env.SLACK_CHANNEL_ID || '',
  cacheMode: 'no-cache',
};
