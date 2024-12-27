import { App, LogLevel } from '@slack/bolt';
import { WebClient, type View } from '@slack/web-api';
import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { answerQuestion, processMessages } from './ai-workflows';
import { defaultConfig } from './config';
import { ConfigModal } from './config-modal';

vi.mock('@slack/bolt');
vi.mock('@slack/web-api');
vi.mock('./ai-workflows');
vi.mock('./config-modal');

type MockedWebClient = { conversations: { history: Mock } };

describe('Slack Bot', () => {
  let app: Partial<App>;
  let mockWebClient: MockedWebClient;
  let messageHandler: Function;
  let commandHandler: Function;
  let viewHandler: Function;

  beforeAll(() => {
    app = {
      command: vi.fn((_, handler) => {
        commandHandler = handler;
      }),
      view: vi.fn((_, handler) => {
        viewHandler = handler;
      }),
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

      vi.mocked(ConfigModal.prototype.getView).mockReturnValue(mockView);

      await handler({ ack: mockAck, body: mockBody, client: mockClient });

      expect(mockAck).toHaveBeenCalled();
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

      expect(mockSay).not.toHaveBeenCalled();
    });

    it('ignore bot messages', async () => {
      expect(messageHandler).toBeDefined();
      const mockSay = vi.fn();
      const message = {
        channel: defaultConfig.channelId,
        subtype: 'bot_message',
        text: 'test message',
      };

      await messageHandler({ message, say: mockSay });

      expect(mockSay).not.toHaveBeenCalled();
    });

    it('processes valid messages and respond', async () => {
      expect(messageHandler).toBeDefined();
      const mockSay = vi.fn();
      const message = {
        channel: defaultConfig.channelId,
        text: 'test message',
      };
      const mockHistory = { messages: [] };
      const mockAnswer = 'AI response';

      mockWebClient.conversations.history.mockResolvedValue(mockHistory);
      vi.mocked(processMessages).mockReturnValue('');
      vi.mocked(answerQuestion).mockResolvedValue(mockAnswer);

      await messageHandler({ message, say: mockSay });

      expect(mockSay).toHaveBeenCalledWith(mockAnswer);
    });
  });
});
