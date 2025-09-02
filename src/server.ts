import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectMongo } from './databases';
import RedisClient from './lib/RedisClient';
import './queues/notification.queue';

import { scheduleHotBooks } from './jobs/scheduleHotBooks';
import { scheduleDailyEmail } from './jobs/scheduleDailyEmail';

const PORT = Number(process.env.PORT || 5001);

(async () => {
  await connectMongo(process.env.MONGO_URI || 'mongodb://localhost:27017/book_review_system');


  RedisClient.getInstance();
    await scheduleHotBooks();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http ://localhost:${PORT}`);
  });
  
  scheduleDailyEmail();
  
})();
