import { generateText } from 'ai';
import { describe, expect, it, vi } from 'vitest';

import { answerQuestion, processMessages } from './workflows';

vi.mock('ai', () => ({
  generateText: vi.fn(),
}));

describe('AI Prompts', () => {
  describe('processMessages', () => {
    it('filters out support team messages and format correctly', () => {
      const messages = [
        { user: 'U1', text: 'Hello' },
        { user: 'U2', text: 'Support message' },
        { user: 'U3', text: 'Question' },
      ];
      const allowedUserIds = ['U2'];

      const result = processMessages(messages, allowedUserIds);
      expect(result).toBe('U1: Hello\nU3: Question');
    });
  });

  describe('answerQuestion', () => {
    it('generates an answer using the AI model', async () => {
      const question = 'What is the capital of France?';
      const context = 'Paris is the capital of France.';
      const model = 'claude-3.5';

      (generateText as any).mockResolvedValueOnce({ text: 'Initial answer' });
      (generateText as any).mockResolvedValueOnce({ text: 'Final answer' });

      const result = await answerQuestion(question, context, model);

      expect(generateText).toHaveBeenCalledTimes(2);
      expect(result).toBe('Final answer');
    });
  });
});
