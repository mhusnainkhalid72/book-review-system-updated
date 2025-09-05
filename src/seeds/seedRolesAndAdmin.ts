import dotenv from 'dotenv';
dotenv.config();

import { connectMongo } from "../databases";
import { RoleModel } from "../databases/models/Role";
import { UserModel } from "../databases/models/User";

async function seed() {
  try {
    // 🔹 Connect to MongoDB
    await connectMongo(process.env.MONGO_URI || 'mongodb://localhost:27017/book_review_system');
    console.log("Connected to MongoDB");

    // 🔹 Default permission sets
    const adminPerms = ['*']; // full access for admin
    const moderatorPerms = [
      'books.create',
      'books.read.any',
      'books.update.any',
      'books.delete.any',
      'users.read.any'
    ];
    const userPerms = [
      'books.create',
      'books.read.own',
      'books.update.own',
      'books.delete.own',
      'books.list'
    ];

    const roles = [
      { name: 'admin', permissions: adminPerms },
      { name: 'moderator', permissions: moderatorPerms },
      { name: 'user', permissions: userPerms }
    ];

    // 🔹 Seed roles
    for (const r of roles) {
      const existing = await RoleModel.findOne({ name: r.name });
      if (!existing) {
        await RoleModel.create(r);
        console.log(`Created role: ${r.name}`);
      } else {
        console.log(`Role exists: ${r.name}, skipping creation`);
      }
    }

    // 🔹 Create admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Admin';

    let admin = await UserModel.findOne({ email: adminEmail });
    const adminRole = await RoleModel.findOne({ name: 'admin' });

    if (!admin) {
      admin = await UserModel.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: adminRole ? adminRole._id : null
      });
      console.log(`Created admin user: ${admin.email}`);
    } else {
      // 🔹 Ensure existing admin has role assigned
      if (!admin.role && adminRole) {
        admin.role = adminRole._id;
        await admin.save();
        console.log(`Assigned admin role to existing user ${admin.email}`);
      } else {
        console.log(`Admin user exists: ${admin.email}`);
      }
    }

    console.log("Seeding complete ✅");
    process.exit(0);

  } catch (err: any) {
    console.error("Seeding failed ❌:", err);
    process.exit(1);
  }
}

seed();
