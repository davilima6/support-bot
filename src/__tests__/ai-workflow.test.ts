import { describe, it, expect, vi } from 'vitest';
import { processMessages, answerQuestion } from '../ai-workflow';
import { generateText } from 'ai';

vi.mock('ai', () => ({
  generateText: vi.fn(),
}));

describe('AI Workflow', () => {
  describe('processMessages', () => {
    it('should filter out support team messages and format correctly', () => {
      const messages = [
        { user: 'U1', text: 'Hello' },
        { user: 'U2', text: 'Support message' },
        { user: 'U3', text: 'Question' },
      ];
      const supportTeamUserIds = ['U2'];

      const result = processMessages(messages, supportTeamUserIds);
      expect(result).toBe('U1: Hello\nU3: Question');
    });
  });

  describe('answerQuestion', () => {
    it('should generate an answer using the AI model', async () => {
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

