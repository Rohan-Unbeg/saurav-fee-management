import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../src/models/Student';

dotenv.config();

const debugStudents = async () => {
  try {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined');
    }
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('--- Debugging Students ---');
    const total = await Student.countDocuments({});
    console.log(`Total Students in DB: ${total}`);

    const notDeleted = await Student.countDocuments({ isDeleted: false });
    console.log(`Students with isDeleted: false: ${notDeleted}`);

    const deleted = await Student.countDocuments({ isDeleted: true });
    console.log(`Students with isDeleted: true: ${deleted}`);

    const undefinedDeleted = await Student.countDocuments({ isDeleted: { $exists: false } });
    console.log(`Students with isDeleted undefined: ${undefinedDeleted}`);

    const sample = await Student.findOne({}).select('firstName isDeleted');
    console.log('Sample Student:', sample);

    console.log('--------------------------');
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
};

debugStudents();
