import { App, LogLevel } from '@slack/bolt';
import { WebClient, type BotMessageEvent, type View } from '@slack/web-api';
import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { answerQuestion, processMessages } from './ai-workflows';
import { DEFAULT_CONFIG } from './config';
import { ConfigModal } from './config-view';

// Mock setup
vi.mock('@slack/bolt');
vi.mock('@slack/web-api');
vi.mock('./ai-workflows');
vi.mock('./config-view', () => ({
  ConfigModal: vi.fn().mockImplementation(() => ({
    getView: vi.fn(),
  })),
}));

type MockedWebClient = { conversations: { history: Mock } };

describe('Slack Bot', () => {
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

    // Load the bot module to register handlers
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
      const mockView: View = {
        type: 'modal',
        callback_id: 'config_modal_submit',
        title: {
          type: 'plain_text',
          text: 'Configure Support Bot',
        },
        blocks: [],
        submit: {
          type: 'plain_text',
          text: 'Submit',
        },
      };

      const mockConfigModal = new ConfigModal(DEFAULT_CONFIG);
      (mockConfigModal.getView as Mock).mockReturnValueOnce(mockView);
      vi.mocked(ConfigModal).mockImplementation(() => mockConfigModal);

      await handler({ ack: mockAck, body: mockBody, client: mockClient });

      expect(mockAck).toHaveBeenCalledTimes(1);
      expect(mockClient.views.open).toHaveBeenCalledWith({
        trigger_id: 'test-trigger',
        view: mockView,
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
      vi.mocked(processMessages).mockReturnValueOnce('');
      vi.mocked(answerQuestion).mockResolvedValueOnce(mockAnswer);

      await messageHandler({ message, say: mockSay });

      expect(mockSay).toHaveBeenCalledWith(mockAnswer);
    });
  });
});
