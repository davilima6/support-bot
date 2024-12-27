import { App, LogLevel } from '@slack/bolt';
import { WebClient, type BotMessageEvent } from '@slack/web-api';
import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { DEFAULT_CONFIG } from './config';
import { answerQuestion, processMessages } from './services/ai/workflows';

type MockedWebClient = { conversations: { history: Mock } };

vi.mock('@slack/bolt');
vi.mock('@slack/web-api');

vi.mock('./services/ai/workflows', () => ({
  processMessages: vi.fn(),
  answerQuestion: vi.fn(),
}));

vi.mock('./config-view', () => ({
  ConfigModal: vi.fn().mockImplementation(() => ({
    getView: vi.fn(),
  })),
}));

vi.mock('./views/settings-modal', () => ({
  SettingsModal: vi.fn().mockImplementation(() => ({
    getView: vi.fn().mockReturnValue({
      type: 'modal',
      callback_id: 'config_modal_submit',
    }),
  })),
}));

describe('Start Bot', () => {
  let app: Partial<App>;
  let mockWebClient: MockedWebClient;
  let messageHandler: Function;

  beforeAll(() => {
    app = {
      command: vi.fn(),
      view: vi.fn(),
      message: vi.fn((handler) => {
        messageHandler = handler;
      }),
      start: vi.fn(),
    };

    mockWebClient = {
      conversations: {
        history: vi.fn(),
      },
    };
  });

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    process.env.SLACK_BOT_TOKEN = 'test-token';
    process.env.SLACK_SIGNING_SECRET = 'test-secret';

    vi.mocked(App).mockImplementation(() => app as any);
    vi.mocked(WebClient).mockImplementation(() => mockWebClient as any);

    // Load the start bot module to register handlers
    await import('./slack-bot');
  });

  it('initializes app with expected config', () => {
    expect(App).toHaveBeenCalledWith({
      token: 'test-token',
      signingSecret: 'test-secret',
      logLevel: LogLevel.DEBUG,
    });
  });

  describe('/configure-ai-bot command', () => {
    it('opens configuration modal', async () => {
      // Get the registered command handler
      const [, handler] = (app.command as Mock).mock.calls.find(([cmd]) => cmd === '/configure-ai-bot') || [];
      expect(handler).toBeDefined();

      const mockAck = vi.fn();
      const mockClient = { views: { open: vi.fn() } };
      const mockBody = { trigger_id: 'test-trigger' };

      await handler({ ack: mockAck, body: mockBody, client: mockClient });

      expect(mockAck).toHaveBeenCalledTimes(1);
      expect(mockClient.views.open).toHaveBeenCalledWith({
        trigger_id: 'test-trigger',
        view: expect.objectContaining({
          type: 'modal',
          callback_id: 'config_modal_submit',
        }),
      });
    });
  });

  describe('message handling', () => {
    it('ignores messages from other channels', async () => {
      expect(messageHandler).toBeDefined();
      const mockSay = vi.fn();
      const message = { channel: 'wrong-channel', text: 'test message' };

      await messageHandler({ message, say: mockSay });

      expect(mockSay).not.toHaveBeenCalledTimes(1);
    });

    it('ignore bot messages', async () => {
      expect(messageHandler).toBeDefined();
      const mockSay = vi.fn();
      const message: Partial<BotMessageEvent> = {
        channel: DEFAULT_CONFIG.channelId,
        subtype: 'bot_message',
        text: 'test message',
      };

      await messageHandler({ message, say: mockSay });

      expect(mockSay).not.toHaveBeenCalledTimes(1);
    });

    it('processes valid messages and respond', async () => {
      expect(messageHandler).toBeDefined();
      const mockSay = vi.fn();
      const message = {
        channel: DEFAULT_CONFIG.channelId,
        text: 'test message',
      };
      const mockHistory = { messages: [] };
      const mockAnswer = 'AI response';

      mockWebClient.conversations.history.mockResolvedValueOnce(mockHistory);
      (processMessages as Mock).mockReturnValueOnce('');
      (answerQuestion as Mock).mockResolvedValueOnce(mockAnswer);

      await messageHandler({ message, say: mockSay });

      expect(mockSay).toHaveBeenCalledWith(mockAnswer);
    });
  });
});
