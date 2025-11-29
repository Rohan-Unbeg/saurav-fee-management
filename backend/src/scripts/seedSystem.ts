import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Course from '../models/Course';
import Student from '../models/Student';
import Transaction from '../models/Transaction';
import Expense from '../models/Expense';
import Counter from '../models/Counter';

import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fee_management';

const seedSystem = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Wipe Database
    console.log('Wiping database...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Student.deleteMany({});
    await Transaction.deleteMany({});
    await Expense.deleteMany({});
    await Counter.deleteMany({});

    // 2. Create Users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Super Admin (Rohan Unbeg)
    await User.create({
      username: 'Rohan Unbeg',
      password: hashedPassword,
      role: 'admin',
      isSuperAdmin: true
    });

    // Secondary Admin
    await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      isSuperAdmin: false
    });

    // Staff
    await User.create({
      username: 'staff',
      password: hashedPassword,
      role: 'staff',
      isSuperAdmin: false
    });

    // 3. Create Courses
    console.log('Creating courses...');
    const courses = await Course.insertMany([
      { name: 'MS-CIT', duration: '3 Months', standardFee: 4500 },
      { name: 'GCC-TBC', duration: '3 Months', standardFee: 3500 },
      { name: 'MKCL Certificate Course', duration: '2 Months', standardFee: 4000 }
    ]);

    // 4. Optional: Demo Data (Students & Transactions)
    if (process.argv.includes('--demo')) {
      console.log('Seeding demo data...');
      
      const mscit = courses.find(c => c.name === 'MS-CIT')!;
      
      // Student 1: Paid
      const student1 = await Student.create({
        firstName: 'Rahul', lastName: 'Sharma',
        studentMobile: '9876543210', parentMobile: '9876543211',
        dob: new Date('2000-01-01'), gender: 'Male', address: 'Pune',
        courseId: mscit._id, batch: 'January 2025',
        admissionDate: new Date(),
        totalFeeCommitted: 4500, totalPaid: 4500, pendingAmount: 0,
        status: 'Paid'
      });

      await Transaction.create({
        studentId: student1._id, amount: 4500, mode: 'Cash',
        receiptNo: 'REC-0001', date: new Date(), remark: 'Full Payment'
      });

      // Student 2: Partial
      const student2 = await Student.create({
        firstName: 'Priya', lastName: 'Patel',
        studentMobile: '9876543212', parentMobile: '9876543213',
        dob: new Date('2001-05-15'), gender: 'Female', address: 'Mumbai',
        courseId: mscit._id, batch: 'January 2025',
        admissionDate: new Date(),
        totalFeeCommitted: 4500, totalPaid: 2000, pendingAmount: 2500,
        status: 'Partial'
      });

      await Transaction.create({
        studentId: student2._id, amount: 2000, mode: 'UPI',
        receiptNo: 'REC-0002', date: new Date(), remark: 'Installment 1'
      });
    }

    console.log('System seeded successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding system:', error);
    process.exit(1);
  }
};

seedSystem();
