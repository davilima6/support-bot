type InitialPromptParams = {
  context: string;
  question: string;
};

type VerificationPromptParams = InitialPromptParams & {
  initialAnswer: string;
};

export function getInitialPrompt(params: InitialPromptParams): string {
  const { context, question } = params;

  return `
${context}

Question: ${question}

Please answer the question based solely on the information provided in the context above. If the answer cannot be found in the context, respond with "I'm sorry, but I don't have enough information to answer that question based on the available context."

Answer:`;
}

export function getVerificationPrompt(params: VerificationPromptParams): string {
  const { context, question, initialAnswer } = params;

  return `
Initial answer: ${initialAnswer}

Question: ${question}

Context:
${context}

Please verify the initial answer and make any necessary adjustments or improvements. Ensure that the final answer is based solely on the information provided in the context. If the answer is not supported by the context, provide a more appropriate response.`;
}
