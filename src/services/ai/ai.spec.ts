import { generateText } from 'ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AIServiceFactory, ClaudeService, GPTService } from './ai';

vi.mock('ai', () => ({
  generateText: vi.fn(),
}));

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GPTService', () => {
    it('generates answer using GPT-4', async () => {
      const service = new GPTService();
      const mockResponse = { text: 'GPT-4 response' };
      (generateText as any).mockResolvedValueOnce(mockResponse);

      const result = await service.generateAnswer('test prompt');

      expect(result).toBe(mockResponse.text);
      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'test prompt',
        })
      );
    });
  });

  describe('ClaudeService', () => {
    it('generates answer using Claude', async () => {
      const service = new ClaudeService();
      const mockResponse = { text: 'Claude response' };
      (generateText as any).mockResolvedValueOnce(mockResponse);

      const result = await service.generateAnswer('test prompt');

      expect(result).toBe(mockResponse.text);
      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'test prompt',
        })
      );
    });
  });

  describe('AIServiceFactory', () => {
    it('creates GPT service for gpt-4 model', () => {
      const service = AIServiceFactory.create('gpt-4');

      expect(service).toBeInstanceOf(GPTService);
    });

    it('creates Claude service for claude-3.5 model', () => {
      const service = AIServiceFactory.create('claude-3.5');

      expect(service).toBeInstanceOf(ClaudeService);
    });

    it('throws error for unsupported model', () => {
      /* @ts-expect-error */
      expect(() => AIServiceFactory.create('unknown')).toThrow('Unsupported AI model');
    });
  });
});
