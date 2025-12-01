import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/User';
import Course from '../src/models/Course';
import Student from '../src/models/Student';
import Transaction from '../src/models/Transaction';
import Expense from '../src/models/Expense';
import Counter from '../src/models/Counter';

dotenv.config({ path: path.join(__dirname, '../.env') });

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Anvi', 'Myra', 'Riya', 'Aarohi', 'Sia'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Yadav', 'Jain', 'Shah', 'Mishra', 'Deshmukh', 'Joshi', 'Kulkarni', 'Patil', 'Pawar', 'Shinde', 'More', 'Gaikwad'];
const batches = ['January 2025', 'February 2025', 'March 2025', 'October 2024', 'November 2024', 'December 2024'];

const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected.');

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
    const superAdminPassword = await bcrypt.hash('Super@Rohan2025!', 10);
    const adminPassword = await bcrypt.hash('Amol@1234#', 10);

    // Super Admin (Rohan)
    await User.create({
      username: 'rohanunbeg',
      password: superAdminPassword,
      role: 'admin',
      isSuperAdmin: true
    });

    // Admin (Amol)
    await User.create({
      username: 'amolsarade',
      password: adminPassword,
      role: 'admin',
      isSuperAdmin: false
    });

    // 3. Create Courses
    console.log('Creating courses...');
    const courses = await Course.insertMany([
      { name: 'MSCIT', duration: '3 Months', standardFee: 5000 },
      { name: 'GCC TBC', duration: '6 Months', standardFee: 19500 },
      { name: 'MKCL Klick', duration: '3 Months', standardFee: 4500 }
    ]);

    console.log('Seed completed successfully! 🌱');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
