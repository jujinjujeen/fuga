import Redis from 'ioredis';

let redis: Redis;

try {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('REDIS_URL is not defined');
  }
  redis = new Redis(url + '?family=0');
} catch (error) {
  console.warn('Failed to connect to Redis using REDIS_URL:', error);
  // Fallback to using REDIS_HOST & REDIS_PORT if available
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  });
  console.warn('Connected to Redis using REDIS_HOST and REDIS_PORT');
}

export default redis;

export const deleteCache = async (key: string) => {
  try {
    await redis.del(key);
    console.log(`Cache deleted for key: ${key}`);
  } catch (error) {
    console.error(`Failed to delete cache for key ${key}:`, error);
  }
};
export const clearCache = async () => {
  try {
    const keys = await redis.keys('cache:*');
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`Cleared ${keys.length} cache keys`);
    } else {
      console.log('No cache keys to clear');
    }
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};
