import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { performBackup } from '../src/services/backupService';

dotenv.config({ path: path.join(__dirname, '../.env') });

const testBackup = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not found');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await performBackup();

    console.log('Test backup completed.');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testBackup();
