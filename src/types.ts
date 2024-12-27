export interface BotConfig {
  channelId: string;
  supportTeamUserIds: string[];
  aiModel: string;
}

export const defaultConfig: BotConfig = {
  channelId: process.env.SLACK_CHANNEL_ID || '',
  supportTeamUserIds: [],
  aiModel: 'claude-3.5',
};

