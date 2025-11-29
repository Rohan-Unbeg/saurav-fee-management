import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../src/models/Student';

dotenv.config();

const createIndex = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Create the compound index
    try {
      await Student.collection.createIndex({ studentMobile: 1, courseId: 1 }, { unique: true });
      console.log('Successfully created compound index: { studentMobile: 1, courseId: 1 }');
    } catch (error) {
      console.error('Error creating index:', error);
      throw error;
    }

    process.exit(0);
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
};

createIndex();
