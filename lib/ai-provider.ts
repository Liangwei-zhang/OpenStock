export type AIProviderName = 'gemini' | 'minimax' | 'siray';

export interface AIProviderConfig {
  name: AIProviderName;
  apiKey: string;
  baseUrl: string;
  model: string;
}

function removedWorkflowError(): never {
  throw new Error('AI provider workflows were removed from the simplified OpenStock build.');
}

export function getProviderConfig(): AIProviderConfig {
  removedWorkflowError();
}

export function getFallbackProviderName(): AIProviderName {
  removedWorkflowError();
}

export async function callAIProvider(): Promise<string> {
  removedWorkflowError();
}

export async function callAIProviderWithFallback(): Promise<string> {
  removedWorkflowError();
}
