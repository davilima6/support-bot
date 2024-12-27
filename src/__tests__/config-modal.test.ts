import { describe, it, expect } from 'vitest';
import { ConfigModal } from '../config-modal';
import { BotConfig } from '../types';

describe('ConfigModal', () => {
  const defaultConfig: BotConfig = {
    channelId: 'C12345',
    supportTeamUserIds: ['U1', 'U2'],
    aiModel: 'claude-3.5',
  };

  it('should generate a valid view', () => {
    const configModal = new ConfigModal(defaultConfig);
    const view = configModal.getView();

    expect(view.type).toBe('modal');
    expect(view.callback_id).toBe('config_modal_submit');
    expect(view.blocks.length).toBe(3);
  });

  it('should parse submission correctly', () => {
    const submissionView = {
      state: {
        values: {
          channel_id: {
            channel_id_input: {
              value: 'C67890',
            },
          },
          support_team_user_ids: {
            support_team_user_ids_input: {
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
    expect(parsedConfig.supportTeamUserIds).toEqual(['U3', 'U4', 'U5']);
    expect(parsedConfig.aiModel).toBe('gpt-4');
  });
});

