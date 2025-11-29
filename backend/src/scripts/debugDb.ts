import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGO_URI; // Note: .env has MONGO_URI, not MONGODB_URI

const debugDb = async () => {
  try {
    console.log('Connecting to:', MONGODB_URI?.split('@')[1]); // Log masked URI
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected.');

    const users = await User.find({});
    console.log('--- USERS IN DB ---');
    users.forEach(u => {
      console.log(`Username: ${u.username}, Role: ${u.role}, SuperAdmin: ${u.isSuperAdmin}`);
    });
    console.log('-------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugDb();
