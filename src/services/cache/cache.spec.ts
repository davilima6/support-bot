import { kv } from '@vercel/kv';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CacheServiceFactory, KVCacheService, NoCacheService } from './cache';

vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

describe('CacheService', () => {
  const channelId = 'test-channel';
  const context = 'test context';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('KVCacheService', () => {
    let service: KVCacheService;

    beforeEach(() => {
      service = new KVCacheService();
    });

    it('gets cached context', async () => {
      vi.mocked(kv.get).mockResolvedValueOnce(context);

      const result = await service.get(channelId);

      expect(result).toBe(context);
      expect(kv.get).toHaveBeenCalledWith('context:test-channel');
    });

    it('sets cache with TTL', async () => {
      await service.set(channelId, context);

      expect(kv.set).toHaveBeenCalledWith('context:test-channel', context, { ex: 3600 });
    });

    it('clears cache', async () => {
      await service.clear(channelId);

      expect(kv.del).toHaveBeenCalledWith('context:test-channel');
    });
  });

  describe('NoCacheService', () => {
    let service: NoCacheService;

    beforeEach(() => {
      service = new NoCacheService();
    });

    it('always returns null for get', async () => {
      const result = await service.get(channelId);
      expect(result).toBeNull();
    });

    it('does nothing for set', async () => {
      await expect(service.set(channelId, context)).resolves.toBeUndefined();
    });

    it('does nothing for clear', async () => {
      await expect(service.clear(channelId)).resolves.toBeUndefined();
    });
  });

  describe('CacheServiceFactory', () => {
    it('creates KVCacheService for kv mode', () => {
      const service = CacheServiceFactory.create('kv');
      expect(service).toBeInstanceOf(KVCacheService);
    });

    it('creates NoCacheService for no-cache mode', () => {
      const service = CacheServiceFactory.create('no-cache');
      expect(service).toBeInstanceOf(NoCacheService);
    });
  });
});
