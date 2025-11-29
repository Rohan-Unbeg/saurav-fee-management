import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Course from './models/Course';
import Student from './models/Student';
import Transaction from './models/Transaction';
import Expense from './models/Expense';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // 1. Clear Database
    console.log('Clearing database...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Student.deleteMany({});
    await Transaction.deleteMany({});
    await Expense.deleteMany({});
    console.log('Database cleared.');

    // 2. Create Users
    console.log('Creating users...');
    
    // Super User
    const superUserPass = 'Super@Rohan2025!';
    const superUserHash = await bcrypt.hash(superUserPass, 10);
    const superUser = new User({
      username: 'rohanunbeg',
      password: superUserHash,
      role: 'admin',
      isSuperAdmin: true
    });

    // Admin User
    const adminPass = 'admin@123';
    const adminHash = await bcrypt.hash(adminPass, 10);
    const adminUser = new User({
      username: 'admin',
      password: adminHash,
      role: 'admin',
      isSuperAdmin: false
    });

    // Staff User
    const staffPass = 'staff@123';
    const staffHash = await bcrypt.hash(staffPass, 10);
    const staffUser = new User({
      username: 'staff',
      password: staffHash,
      role: 'staff',
      isSuperAdmin: false
    });

    await User.insertMany([superUser, adminUser, staffUser]);
    console.log('Users created:');
    console.log(`- Super Admin: rohanunbeg / ${superUserPass}`);
    console.log(`- Admin: admin / ${adminPass}`);
    console.log(`- Staff: staff / ${staffPass}`);

    // 3. Create Courses
    console.log('Creating courses...');
    const courses = [
      { name: 'mscit', duration: '6 Months', standardFee: 5000 },
      { name: 'gcc-tbc', duration: '3 Months', standardFee: 3500 },
      { name: 'mkcl course', duration: '1 Year', standardFee: 15000 }
    ];

    await Course.insertMany(courses);
    console.log('Courses created:', courses.map(c => c.name).join(', '));

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
