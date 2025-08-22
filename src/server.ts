import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectMongo } from './databases';
import RedisClient from './lib/RedisClient';

const PORT = Number(process.env.PORT || 4000);

(async () => {
  await connectMongo(process.env.MONGO_URI || 'mongodb://localhost:27017/book_review_system');

  // Initialize Redis (singleton)
  RedisClient.getInstance();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http ://localhost:${PORT}`);
  });
})();
