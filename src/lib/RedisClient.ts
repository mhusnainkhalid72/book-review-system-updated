import Redis from 'ioredis';

class RedisClient {
  private static instance: Redis;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null
      });

      RedisClient.instance.on('error', (err) => {
        console.error('Redis Client Error', err);
      });

      RedisClient.instance.on('connect', () => {
        console.log('Redis connected');
      });

      RedisClient.instance.ping().then((res) => {
        console.log(`Redis is connected: ${res}`);
      });
    }

    return RedisClient.instance;
  }
}

export default RedisClient;
