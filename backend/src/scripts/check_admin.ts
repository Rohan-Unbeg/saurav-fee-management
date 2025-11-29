import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const admin = await User.findOne({ username: 'admin' });
    if (admin) {
      console.log('Admin user found:', admin.username);
      console.log('Role:', admin.role);
      console.log('Password Hash:', admin.password);
    } else {
      console.log('Admin user NOT found');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdmin();
