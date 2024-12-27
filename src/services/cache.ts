import { kv } from '@vercel/kv';

const CACHE_TTL_SEC = 60 * 60; // 1 hour
const CACHE_PREFIX = 'context:';

export async function getCachedContext(channelId: string): Promise<string | null> {
  const key = `${CACHE_PREFIX}${channelId}`;

  return kv.get(key);
}

export async function setCachedContext(channelId: string, context: string): Promise<void> {
  const key = `${CACHE_PREFIX}${channelId}`;

  await kv.set(key, context, { ex: CACHE_TTL_SEC });
}

export async function clearCachedContext(channelId: string): Promise<void> {
  const key = `${CACHE_PREFIX}${channelId}`;

  await kv.del(key);
}
