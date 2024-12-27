import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export function processMessages(messages: any[], supportTeamUserIds: string[]): string {
  return messages
    .filter(msg => !supportTeamUserIds.includes(msg.user))
    .map(msg => `${msg.user}: ${msg.text}`)
    .join('\n');
}

export async function answerQuestion(question: string, context: string, model: string): Promise<string> {
  const aiModel = model === 'gpt-4' ? openai('gpt-4') : anthropic('claude-3.5');

  const prompt = `
Context:
${context}

Question: ${question}

Please answer the question based solely on the information provided in the context above. If the answer cannot be found in the context, respond with "I'm sorry, but I don't have enough information to answer that question based on the available context."

Answer:`;

  const { text: initialAnswer } = await generateText({
    model: aiModel,
    prompt: prompt,
  });

  // Secondary LLM actor for verification and improvement
  const verificationPrompt = `
Initial answer: ${initialAnswer}

Question: ${question}

Context:
${context}

Please verify the initial answer and make any necessary adjustments or improvements. Ensure that the final answer is based solely on the information provided in the context. If the answer is not supported by the context, provide a more appropriate response.

Final answer:`;

  const { text: finalAnswer } = await generateText({
    model: aiModel,
    prompt: verificationPrompt,
  });

  return finalAnswer;
}

