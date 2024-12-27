import type { MessageElement } from '@slack/web-api/dist/types/response/ConversationsHistoryResponse';
import { getInitialPrompt, getVerificationPrompt } from './ai-prompts';
import { AIServiceFactory, type Model } from './services/ai-service';

export function processMessages(messages: MessageElement[] | undefined, allowedUserIds: string[]): string {
  return (
    messages
      ?.filter((msg) => !allowedUserIds.includes(msg.user ?? ''))
      .map((msg) => `${msg.user}: ${msg.text}`)
      .join('\n') || ''
  );
}

export async function answerQuestion(question: string | undefined, context: string, model: Model): Promise<string> {
  if (!question) {
    throw new Error('Question is required.');
  }

  const aiService = AIServiceFactory.create(model);

  const prompt = getInitialPrompt({ context, question });
  const initialAnswer = await aiService.generateAnswer(prompt);

  const verificationPrompt = getVerificationPrompt({
    context,
    question,
    initialAnswer,
  });

  const finalAnswer = await aiService.generateAnswer(verificationPrompt);
  return finalAnswer;
}
