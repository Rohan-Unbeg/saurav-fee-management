import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Student from '../src/models/Student';

dotenv.config({ path: path.join(__dirname, '../.env') });

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    const total = await Student.countDocuments({ isDeleted: false });
    console.log('Total Students:', total);

    const limit = 9;
    const totalPages = Math.ceil(total / limit);
    console.log('Calculated Total Pages:', totalPages);

    const page1 = await Student.find({ isDeleted: false }).limit(limit);
    console.log('Page 1 Count:', page1.length);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

verify();
