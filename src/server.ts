// src/server.ts
import dotenv from 'dotenv';
dotenv.config();
import { io } from "./socket"; 
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { connectMongo } from './databases';
import RedisClient from './lib/RedisClient';
import './queues/notification.queue';

import { scheduleHotBooks } from './jobs/scheduleHotBooks';
import { scheduleDailyEmail } from './jobs/scheduleDailyEmail';
import { initSocket } from './socket';
import { ReportService } from "./services/ReportService";
const PORT = Number(process.env.PORT || 5001);

(async () => {
  try {
    // Connect to MongoDB
    await connectMongo(process.env.MONGO_URI || 'mongodb://localhost:27017/book_review_system');
    console.log(' MongoDB connected');

    // Initialize Redis
    RedisClient.getInstance();
    console.log(' Redis initialized');

    // Start scheduled jobs
    await scheduleHotBooks();
    scheduleDailyEmail();
    console.log(' Scheduled jobs initialized');

    // Create HTTP server from Express app
    const server = http.createServer(app);

    // Initialize Socket.IO
    initSocket(server);
    console.log(' Socket.IO initialized');

const reportService = new ReportService();
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
})();
