import { describe, expect, it } from 'vitest';

import { getInitialPrompt, getVerificationPrompt } from './prompts';

describe('getInitialPrompt', () => {
  it('generates initial prompt with context and question', () => {
    const params = {
      context: 'Some context',
      question: 'Test question',
    };

    const result = getInitialPrompt(params);

    expect(result).toContain(params.context);
    expect(result).toContain(params.question);
    expect(result).toContain('Please answer the question');
  });
});

describe('getVerificationPrompt', () => {
  it('generates verification prompt with context, question and initial answer', () => {
    const params = {
      context: 'Some context',
      question: 'Test question',
      initialAnswer: 'Initial test answer',
    };

    const result = getVerificationPrompt(params);

    expect(result).toContain(params.context);
    expect(result).toContain(params.question);
    expect(result).toContain(params.initialAnswer);
    expect(result).toContain('Please verify the initial answer');
  });
});
