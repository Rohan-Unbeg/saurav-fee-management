import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Course from '../models/Course';
import Student from '../models/Student';
import Transaction from '../models/Transaction';
import Counter from '../models/Counter';
import AuditLog from '../models/AuditLog';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetDb = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear all collections
    await User.deleteMany({});
    await Course.deleteMany({});
    await Student.deleteMany({});
    await Transaction.deleteMany({});
    await Counter.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('All collections cleared');

    // Seed Admin
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      password: hashedAdminPassword,
      role: 'admin',
    });
    await admin.save();
    console.log('Admin user created: admin / admin123');

    // Seed Staff
    const hashedStaffPassword = await bcrypt.hash('staff123', 10);
    const staff = new User({
      username: 'staff',
      password: hashedStaffPassword,
      role: 'staff',
    });
    await staff.save();
    console.log('Staff user created: staff / staff123');

    // Seed Courses
    const courses = [
      { name: 'Full Stack Development', duration: '6 Months', standardFee: 50000 },
      { name: 'Data Science', duration: '8 Months', standardFee: 75000 },
      { name: 'UI/UX Design', duration: '4 Months', standardFee: 35000 },
    ];
    await Course.insertMany(courses);
    console.log('Initial courses created');

    console.log('Database reset and seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDb();
