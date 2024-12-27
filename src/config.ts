import type { Model } from './services/ai-service';

export type CacheMode = 'no-cache' | 'kv';

export type BotConfig = {
  aiModel: Model;
  allowedUserIds: string[];
  channelId: string;
  cacheMode: CacheMode;
};

export const DEFAULT_PORT = 3_000;

export const DEFAULT_CONFIG: BotConfig = {
  aiModel: 'claude-3.5',
  allowedUserIds: [],
  channelId: process.env.SLACK_CHANNEL_ID || '',
  cacheMode: 'no-cache',
};

/** Maximum of 999 */
export const CHANNEL_HISTORY_LIMIT = 999;
