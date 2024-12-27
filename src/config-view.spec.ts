// Import test utilities and components to test
import { describe, expect, it } from 'vitest';
import { BotConfig } from './config';
import { ConfigModal } from './config-view';

describe('ConfigModal', () => {
  const defaultConfig: BotConfig = {
    channelId: 'C12345',
    allowedUserIds: ['U1', 'U2'],
    aiModel: 'claude-3.5',
    cacheMode: 'no-cache',
  };

  it('generates a view', () => {
    const configModal = new ConfigModal(defaultConfig);
    const view = configModal.getView();

    expect(view.type).toBe('modal');
    expect(view.callback_id).toBe('config_modal_submit');
    expect(view.blocks.length).toBe(4); // Updated block count: channel_id, allowed_user_ids, ai_model, cache_mode
  });

  it('parses submission', () => {
    const submissionView = {
      state: {
        values: {
          channel_id: {
            channel_id_input: {
              value: 'C67890',
            },
          },
          allowed_user_ids: {
            allowed_user_ids_input: {
              value: 'U3, U4, U5',
            },
          },
          ai_model: {
            ai_model_select: {
              selected_option: {
                value: 'gpt-4',
              },
            },
          },
          cache_mode: {
            cache_mode_select: {
              selected_option: {
                value: 'default',
              },
            },
          },
        },
      },
    };

    const parsedConfig = ConfigModal.parseSubmission(submissionView as any);

    expect(parsedConfig.channelId).toBe('C67890');
    expect(parsedConfig.allowedUserIds).toEqual(['U3', 'U4', 'U5']);
    expect(parsedConfig.aiModel).toBe('gpt-4');
    expect(parsedConfig.cacheMode).toBe('default');
  });
});
