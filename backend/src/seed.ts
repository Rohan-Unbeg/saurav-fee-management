import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course';
import Student from './models/Student';
import Transaction from './models/Transaction';
import User from './models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fee-management');
    console.log('MongoDB Connected');

    // Clear existing data
    await Course.deleteMany({});
    await Student.deleteMany({});
    await Transaction.deleteMany({});

    // Create Admin User
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created');
    }

    // Seed Courses
    const courses = await Course.insertMany([
      { name: 'MS-CIT', duration: '3 Months', standardFee: 4500 },
      { name: 'GCC-TBC', duration: '6 Months', standardFee: 6000 },
      { name: 'Tally Prime', duration: '2 Months', standardFee: 5000 }
    ]);
    console.log('Courses Seeded');

    // Seed Students
    const students = await Student.insertMany([
      {
        firstName: 'Rohan',
        lastName: 'Sharma',
        dob: new Date('2000-05-15'),
        gender: 'Male',
        address: 'Shivaji Nagar, Pune',
        studentMobile: '9876543210',
        parentMobile: '9123456780',
        courseId: courses[0]._id,
        batch: 'Jan 2025',
        admissionDate: new Date(),
        standardFee: 4500,
        totalFeeCommitted: 4500,
        totalPaid: 2000,
        pendingAmount: 2500,
        status: 'Partial'
      },
      {
        firstName: 'Priya',
        lastName: 'Patel',
        dob: new Date('2001-08-20'),
        gender: 'Female',
        address: 'Kothrud, Pune',
        studentMobile: '9988776655',
        parentMobile: '8877665544',
        courseId: courses[1]._id,
        batch: 'Feb 2025',
        admissionDate: new Date(),
        standardFee: 3000,
        totalFeeCommitted: 3000,
        totalPaid: 0,
        pendingAmount: 3000,
        status: 'Unpaid'
      },
      {
        firstName: 'Amit',
        lastName: 'Verma',
        dob: new Date('1999-12-10'),
        gender: 'Male',
        address: 'Hadapsar, Pune',
        studentMobile: '7766554433',
        parentMobile: '6655443322',
        courseId: courses[2]._id,
        batch: 'Jan 2025',
        admissionDate: new Date(),
        standardFee: 4000,
        totalFeeCommitted: 4000,
        totalPaid: 4000,
        pendingAmount: 0,
        status: 'Paid'
      }
    ]);
    console.log('Students Seeded');

    // Seed Transactions
    await Transaction.insertMany([
      {
        studentId: students[0]._id,
        amount: 2000,
        date: new Date(),
        mode: 'Cash',
        receiptNo: `REC-${Date.now()}-1`,
        remark: 'First Installment'
      },
      {
        studentId: students[2]._id,
        amount: 4000,
        date: new Date(),
        mode: 'UPI',
        receiptNo: `REC-${Date.now()}-2`,
        remark: 'Full Payment'
      }
    ]);
    console.log('Transactions Seeded');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
