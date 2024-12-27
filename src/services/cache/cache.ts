import { kv } from '@vercel/kv';

import type { CacheMode } from '../../config';

export type CacheService = {
  get(channelId: string): Promise<string | null>;
  set(channelId: string, context: string): Promise<void>;
  clear(channelId: string): Promise<void>;
};

const CACHE_TTL_SEC = 60 * 60; // 1 hour
const CACHE_PREFIX = 'context:';

export class KVCacheService implements CacheService {
  private getKey(channelId: string): string {
    return `${CACHE_PREFIX}${channelId}`;
  }

  async get(channelId: string): Promise<string | null> {
    return kv.get(this.getKey(channelId));
  }

  async set(channelId: string, context: string): Promise<void> {
    await kv.set(this.getKey(channelId), context, { ex: CACHE_TTL_SEC });
  }

  async clear(channelId: string): Promise<void> {
    await kv.del(this.getKey(channelId));
  }
}

export class NoCacheService implements CacheService {
  async get(_channelId: string): Promise<null> {
    return null;
  }

  async set(_channelId: string, _context: string): Promise<void> {}

  async clear(_channelId: string): Promise<void> {}
}

export class CacheServiceFactory {
  static create(mode: CacheMode): CacheService {
    switch (mode) {
      case 'kv':
        return new KVCacheService();
      case 'no-cache':
      default:
        return new NoCacheService();
    }
  }
}
