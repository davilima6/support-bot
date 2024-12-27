import { View } from '@slack/types';
import { BotConfig } from './types';

export class ConfigModal {
  private config: BotConfig;

  constructor(config: BotConfig) {
    this.config = config;
  }

  getView(): View {
    return {
      type: 'modal',
      callback_id: 'config_modal_submit',
      title: {
        type: 'plain_text',
        text: 'Configure AI Bot',
      },
      blocks: [
        {
          type: 'input',
          block_id: 'channel_id',
          label: {
            type: 'plain_text',
            text: 'Channel ID',
          },
          element: {
            type: 'plain_text_input',
            action_id: 'channel_id_input',
            initial_value: this.config.channelId,
          },
        },
        {
          type: 'input',
          block_id: 'support_team_user_ids',
          label: {
            type: 'plain_text',
            text: 'Support Team User IDs (comma-separated)',
          },
          element: {
            type: 'plain_text_input',
            action_id: 'support_team_user_ids_input',
            initial_value: this.config.supportTeamUserIds.join(','),
          },
        },
        {
          type: 'input',
          block_id: 'ai_model',
          label: {
            type: 'plain_text',
            text: 'AI Model',
          },
          element: {
            type: 'static_select',
            action_id: 'ai_model_select',
            initial_option: {
              text: {
                type: 'plain_text',
                text: this.config.aiModel,
              },
              value: this.config.aiModel,
            },
            options: [
              {
                text: {
                  type: 'plain_text',
                  text: 'Claude 3.5',
                },
                value: 'claude-3.5',
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'GPT-4',
                },
                value: 'gpt-4',
              },
            ],
          },
        },
      ],
      submit: {
        type: 'plain_text',
        text: 'Submit',
      },
    };
  }

  static parseSubmission(view: View): Partial<BotConfig> {
    const values = view.state.values;
    return {
      channelId: values.channel_id.channel_id_input.value,
      supportTeamUserIds: values.support_team_user_ids.support_team_user_ids_input.value.split(',').map(id => id.trim()),
      aiModel: values.ai_model.ai_model_select.selected_option.value,
    };
  }
}

