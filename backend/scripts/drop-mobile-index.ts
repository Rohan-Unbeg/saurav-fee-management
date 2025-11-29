import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../src/models/Student';

dotenv.config();

const dropIndex = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Drop the index
    try {
      await Student.collection.dropIndex('studentMobile_1');
      console.log('Successfully dropped index: studentMobile_1');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('Index studentMobile_1 does not exist. Skipping.');
      } else {
        throw error;
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error dropping index:', error);
    process.exit(1);
  }
};

dropIndex();
