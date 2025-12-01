import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/User';

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected.');

    const users = await User.find({});
    console.log('\n--- All Users in DB ---');
    users.forEach(u => {
      console.log(`- Username: ${u.username}, Role: ${u.role}, ID: ${u._id}`);
    });
    console.log('-----------------------\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkUsers();
