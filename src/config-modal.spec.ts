// Import test utilities and components to test
import { describe, expect, it } from 'vitest';
import { BotConfig } from './config';
import { ConfigModal } from './config-modal';

describe('ConfigModal', () => {
  const defaultConfig: BotConfig = {
    channelId: 'C12345',
    allowedUserIds: ['U1', 'U2'],
    aiModel: 'claude-3.5',
  };

  it('generates a view', () => {
    const configModal = new ConfigModal(defaultConfig);
    const view = configModal.getView();

    expect(view.type).toBe('modal');
    expect(view.callback_id).toBe('config_modal_submit');
    expect(view.blocks.length).toBe(3);
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
        },
      },
    };

    const parsedConfig = ConfigModal.parseSubmission(submissionView as any);

    expect(parsedConfig.channelId).toBe('C67890');
    expect(parsedConfig.allowedUserIds).toEqual(['U3', 'U4', 'U5']);
    expect(parsedConfig.aiModel).toBe('gpt-4');
  });
});
