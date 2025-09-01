import { UserModel } from '../databases/models/User';
import { ReviewModel } from '../databases/models/Review';
import { NotificationModel } from '../databases/models/Notification';
import { sendEmail } from './EmailService';
import { sendPush } from './PushService';

export class NotificationService {
  // ✅ Push notification
  static async sendPushNotification(userId: string, message: string) {
    const user = await UserModel.findById(userId);
    if (!user || !user.deviceToken) return;

    // Send push
    await sendPush(user.deviceToken, message);

    // Save notification in DB
    await NotificationModel.create({
      user: user._id,
      message,
      type: 'review',
    });
  }

  // ✅ Daily email summary
  static async sendDailyEmail(userId?: string) {
    const users = userId ? [await UserModel.findById(userId)] : await UserModel.find({});
    for (const user of users) {
      if (!user) continue;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const reviews = await ReviewModel.find({
        bookOwner: user._id,
        createdAt: { $gte: yesterday },
      }).populate<{ book: { title: string } }>('book', 'title');

      if (reviews.length === 0) continue;

      const message = reviews
        .map((r) => `Your book "${r.book.title}" got a new review: "${r.message}"`)
        .join('\n');

      await sendEmail(user.email, 'Daily Review Summary', message);

      // Save daily notification in DB
      await NotificationModel.create({
        user: user._id,
        message,
        type: 'daily',
      });
    }
  }
}
