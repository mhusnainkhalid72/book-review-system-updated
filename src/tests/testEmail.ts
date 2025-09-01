import mongoose from 'mongoose';
import { NotificationService } from '../services/notification.service';
import { UserModel } from '../databases/models/User';
import dotenv from 'dotenv';

// 1️⃣ Load environment variables
dotenv.config();

async function testEmail() {
  try {
    // 2️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book-review-db');
    console.log('MongoDB connected');

    // 3️⃣ Create or find test user
    const testEmail = 'mhusniankhalid7247@gmail.com';
    let user = await UserModel.findOne({ email: testEmail });

    if (!user) {
      user = await UserModel.create({
        name: 'Test User',
        email: testEmail,
        password: 'testpassword123', // plain text is fine for testing
        deviceToken: 'test_device_token',
      });
      console.log('Test user created');
    } else {
      console.log('Test user already exists');
    }

    // 4️⃣ Send daily email
    await NotificationService.sendDailyEmail(user._id.toString());
    console.log('Daily email sent!');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    // 5️⃣ Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// 6️⃣ Run the test
testEmail();
