import { kv } from '@vercel/kv';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearCachedContext, getCachedContext, setCachedContext } from './cache';

vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

describe('Cache', () => {
  const mockKv = vi.mocked(kv);
  const channelId = 'test-channel';
  const testContext = 'test context';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCachedContext', () => {
    it('returns cached context', async () => {
      mockKv.get.mockResolvedValue(testContext);

      const result = await getCachedContext(channelId);

      expect(result).toBe(testContext);
      expect(mockKv.get).toHaveBeenCalledWith('context:test-channel');
    });

    it('returns null when no cached context exists', async () => {
      mockKv.get.mockResolvedValue(null);

      const result = await getCachedContext(channelId);

      expect(result).toBeNull();
    });
  });

  describe('setCachedContext', () => {
    it('sets cache with TTL', async () => {
      await setCachedContext(channelId, testContext);

      expect(mockKv.set).toHaveBeenCalledWith('context:test-channel', testContext, { ex: 3600 });
    });
  });

  describe('clearCachedContext', () => {
    it('deletes cached context', async () => {
      await clearCachedContext(channelId);

      expect(mockKv.del).toHaveBeenCalledWith('context:test-channel');
    });
  });
});
