import type { ViewOutput } from '@slack/bolt';
import type { View } from '@slack/web-api';

import type { BotConfig, CacheMode } from './config';
import { isModel } from './services/ai-service';

export class ConfigModal {
  constructor(private readonly config: BotConfig) {}

  getView(): View {
    return {
      type: 'modal',
      callback_id: 'config_modal_submit',
      title: {
        type: 'plain_text',
        text: 'Configure Support Bot',
      },
      blocks: [
        // Channel ID input
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
            initial_value: this.config.channelId ?? undefined,
          },
        },
        // Allowed User IDs input
        {
          type: 'input',
          block_id: 'allowed_user_ids',
          label: {
            type: 'plain_text',
            text: 'Allowed User IDs (comma-separated)',
          },
          element: {
            type: 'plain_text_input',
            action_id: 'allowed_user_ids_input',
            initial_value: this.config.allowedUserIds?.join(','),
          },
        },
        // AI Model input
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
        // Cache Mode input
        {
          type: 'input',
          block_id: 'cache_mode',
          label: {
            type: 'plain_text',
            text: 'Cache Mode',
          },
          element: {
            type: 'static_select',
            action_id: 'cache_mode_select',
            initial_option: {
              text: {
                type: 'plain_text',
                text: this.config.cacheMode === 'no-cache' ? 'No Cache' : 'Vercel KV Cache',
              },
              value: this.config.cacheMode,
            },
            options: [
              {
                text: { type: 'plain_text', text: 'No Cache' },
                value: 'no-cache',
              },
              {
                text: { type: 'plain_text', text: 'Vercel KV' },
                value: 'kv',
              },
            ],
          },
        },
      ],
      // Submit button
      submit: {
        type: 'plain_text',
        text: 'Submit',
      },
    };
  }

  static parseSubmission(view: ViewOutput): Partial<BotConfig> {
    const { values } = view.state;
    const channelId = values.channel_id.channel_id_input.value;
    const allowedUserIds =
      values.allowed_user_ids.allowed_user_ids_input.value?.split(',').map((id) => id.trim()) ?? [];
    const aiModel = values.ai_model.ai_model_select.selected_option?.value;
    const cacheMode = values.cache_mode.cache_mode_select.selected_option?.value as CacheMode;

    if (!channelId) {
      throw new Error('Channel is required.');
    }

    if (!isModel(aiModel)) {
      throw new Error('AI Model is invalid.');
    }

    return {
      aiModel,
      allowedUserIds,
      channelId,
      cacheMode,
    };
  }
}
