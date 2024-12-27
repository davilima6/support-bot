import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const MODELS = ['gpt-4', 'claude-3.5'] as const;

export type Model = (typeof MODELS)[number];

export function isModel(model: string | undefined): model is Model {
  return Boolean(model && MODELS.includes(model as Model));
}

export type AIService = {
  generateAnswer(prompt: string): Promise<string>;
};

export class GPTService implements AIService {
  async generateAnswer(prompt: string): Promise<string> {
    const { text } = await generateText({
      model: openai('gpt-4'),
      prompt,
    });

    return text;
  }
}

export class ClaudeService implements AIService {
  async generateAnswer(prompt: string): Promise<string> {
    const { text } = await generateText({
      model: anthropic('claude-3.5'),
      prompt,
    });

    return text;
  }
}

export class AIServiceFactory {
  static create(model: Model): AIService {
    switch (model) {
      case 'gpt-4':
        return new GPTService();
      case 'claude-3.5':
        return new ClaudeService();
      default:
        throw new Error(`Unsupported AI model: ${model}`);
    }
  }
}
