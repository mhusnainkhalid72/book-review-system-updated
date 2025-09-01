// src/testHotBooks.ts
import { connectMongo } from '../databases';
import { BooksPopularityService } from '../services/BooksPopularityService';
import { RedisCache } from '../lib/RedisCache';
import { CacheKeys } from '../cache/cache.keys';
import { TTL } from '../cache/cache.ttl';

(async () => {
  // Connect to MongoDB
  await connectMongo(process.env.MONGO_URI || 'mongodb://localhost:27017/book_review_system');

  const service = new BooksPopularityService();
  const hotBooks = await service.computeHot(1, 10);

  await RedisCache.set(CacheKeys.hotBooks(1, 10), hotBooks, TTL.HOT_BOOKS);

  console.log('Hot books updated:', hotBooks);
  process.exit(0); // Exit after script finishes
})();
