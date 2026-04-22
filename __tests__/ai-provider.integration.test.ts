import { describe, it, expect } from 'vitest';
import { callAIProvider, callAIProviderWithFallback } from '@/lib/ai-provider';

describe('deprecated AI provider compatibility layer', () => {
  it('throws a clear error for direct provider calls', async () => {
    await expect(callAIProvider()).rejects.toThrow(
      'AI provider workflows were removed from the simplified OpenStock build.'
    );
  });

  it('throws a clear error for fallback provider calls', async () => {
    await expect(callAIProviderWithFallback()).rejects.toThrow(
      'AI provider workflows were removed from the simplified OpenStock build.'
    );
  });
});
