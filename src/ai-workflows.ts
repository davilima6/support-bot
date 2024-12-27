import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import type { MessageElement } from '@slack/web-api/dist/types/response/ConversationsHistoryResponse';
import { generateText } from 'ai';

import { getInitialPrompt, getVerificationPrompt } from './ai-prompts';

export function processMessages(messages: MessageElement[] | undefined, allowedUserIds: string[]): string {
  return (
    messages
      ?.filter((msg) => !allowedUserIds.includes(msg.user ?? ''))
      .map((msg) => `${msg.user}: ${msg.text}`)
      .join('\n') || ''
  );
}

export async function answerQuestion(question: string | undefined, context: string, model: string): Promise<string> {
  if (!question) {
    throw new Error('Question is required.');
  }

  const aiModel = model === 'gpt-4' ? openai('gpt-4') : anthropic('claude-3.5');

  const prompt = getInitialPrompt({ context, question });

  const { text: initialAnswer } = await generateText({
    model: aiModel,
    prompt: prompt,
  });

  const verificationPrompt = getVerificationPrompt({
    context,
    question,
    initialAnswer,
  });

  const { text: finalAnswer } = await generateText({
    model: aiModel,
    prompt: verificationPrompt,
  });

  return finalAnswer;
}
