// FILE: src/services/notification.service.ts
import mongoose from 'mongoose';
import { UserModel } from '../databases/models/User';
import { BookModel } from '../databases/models/Book';
import { ReviewModel } from '../databases/models/Review';
import { NotificationModel } from '../databases/models/Notification';
import { sendEmail } from './EmailService';
import { sendPush } from './PushService';

export class NotificationService {

  static async sendDailyEmail(userId?: string, windowMinutes: number = 60) {
    try {
      const since = new Date(Date.now() - windowMinutes * 60 * 1000);

      // If userId provided -> targeted digest. Otherwise, global sweep (for once-daily run).
      const users = userId
        ? (await UserModel.findById(userId).lean()?.then(u => (u ? [u] : [])))
        : await UserModel.find({}).lean();

      if (!users || users.length === 0) return;

      for (const user of users) {
        try {
          if (!user?.email) continue;

          // De-dupe: if we already emitted a daily notification in this lookback, skip
          const alreadySent = await NotificationModel.findOne({
            user: user._id,
            type: 'daily',
            createdAt: { $gte: since },
          }).lean();
          if (alreadySent) continue;

          // Owner's books
          const ownedBooks = await BookModel.find({ user: user._id })
            .select('_id title')
            .lean();
          if (!ownedBooks.length) continue;

          const bookIds = ownedBooks.map(b => b._id);

          // Reviews within the window for these books
          const reviews = await ReviewModel.find({
            book: { $in: bookIds },
            createdAt: { $gte: since },
          })
            .populate<{ book: { title: string } }>('book', 'title')
            .lean();

          if (!reviews.length) continue; // nothing new -> skip sending

          const lines = reviews.map(r =>
            `Your book "${r.book?.title || 'Untitled'}" got a new review: "${r.message || ''}"`
          );
          const message = lines.join('\n').trim();

          if (!message) continue; // extra guard

          // Send email
          await sendEmail(user.email, 'Review Summary', message);

          // Record the daily notification (for de-dupe + audit)
          await NotificationModel.create({
            user: user._id,
            message,
            type: 'daily',
          });
        } catch (perUserErr: any) {
          console.error('[NotificationService.sendDailyEmail] per-user error', {
            userId: user?._id?.toString(),
            message: perUserErr?.message,
          });
          // continue other users
        }
      }
    } catch (err: any) {
      console.error('[NotificationService.sendDailyEmail] fatal', {
        message: err?.message,
        stack: err?.stack,
      });
    }
  }

  /** Push notification for an owner (safe, ignores missing token). */
  static async sendPushNotification(userId: string, message: string) {
    try {
      if (!mongoose.isValidObjectId(userId)) {
        console.warn('[NotificationService.sendPushNotification] invalid userId', { userId });
        return;
      }
      const user = await UserModel.findById(userId).lean();
      if (!user) return;

      if (!user.deviceToken) {
        // Not an error; owner has no device registered
        console.warn('[NotificationService.sendPushNotification] missing deviceToken', { userId });
        return;
      }

      await sendPush(user.deviceToken, message);

      await NotificationModel.create({
        user: user._id,
        message,
        type: 'review',
      });
    } catch (err: any) {
      console.error('[NotificationService.sendPushNotification] failed', {
        message: err?.message,
        stack: err?.stack,
      });
    }
  }
}
