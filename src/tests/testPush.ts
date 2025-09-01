import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { NotificationService } from '../services/notification.service';
import { UserModel } from '../databases/models/User';

// 1️⃣ Load environment variables
dotenv.config();

async function testPush() {
  try {
    // 2️⃣ Connect to the same MongoDB as your server
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book_review_system';
    await mongoose.connect(mongoURI);
    console.log(`MongoDB connected to ${mongoURI}`);

    // 3️⃣ Find or create test user
    const testEmail = 'mhusnainkhalid7247@gmail.com';
    let user = await UserModel.findOne({ email: testEmail });

    if (!user) {
      user = await UserModel.create({
        name: 'Test User',
        email: testEmail,
        password: 'testpassword123', // plain text for testing
        deviceToken: 'husnain',     // dummy push token
      });
      console.log('Test user created');
    } else {
      console.log('Test user already exists');
    }

    // 4️⃣ Send push notification
    await NotificationService.sendPushNotification(user._id.toString(), 'Test push notification!');
    console.log('Push notification sent!');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    // 5️⃣ Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// 6️⃣ Run the test
testPush();

