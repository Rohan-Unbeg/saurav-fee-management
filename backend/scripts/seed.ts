import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Student from '../src/models/Student';
import Transaction from '../src/models/Transaction';
import Course from '../src/models/Course';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const count = 1000;
    const batchYears = ['2024', '2025'];
    const batchMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Get a course ID
    const course = await Course.findOne();
    if (!course) {
      console.error('Please create at least one course first.');
      process.exit(1);
    }

    console.log(`Using course: ${course.name}`);

    const students = [];
    const transactions = [];

    for (let i = 0; i < count; i++) {
      const firstName = `Student${i}`;
      const lastName = `Test`;
      const mobile = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
      const batch = `${batchMonths[Math.floor(Math.random() * batchMonths.length)]} ${batchYears[Math.floor(Math.random() * batchYears.length)]}`;
      
      const totalFee = 5000;
      const rand = Math.random();
      const paid = rand > 0.6 ? 5000 : (rand > 0.3 ? 2500 : 0);
      const status = paid === 5000 ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid');

      const student = new Student({
        firstName,
        lastName,
        studentMobile: mobile,
        parentMobile: mobile,
        courseId: course._id,
        batch,
        dob: new Date(),
        gender: 'Male',
        address: 'Test Address',
        admissionDate: new Date(),
        totalFeeCommitted: totalFee,
        totalPaid: paid,
        pendingAmount: totalFee - paid,
        status,
        isDeleted: false
      });

      students.push(student);

      if (paid > 0) {
        transactions.push(new Transaction({
          studentId: student._id,
          amount: paid,
          mode: 'Cash',
          date: new Date(),
          receiptNo: `REC-TEST-${i}-${Date.now()}`, // Ensure uniqueness
          remark: 'Seed Data'
        }));
      }
    }

    console.log('Inserting students...');
    await Student.insertMany(students);
    console.log('Inserting transactions...');
    await Transaction.insertMany(transactions);

    console.log(`Successfully seeded ${count} students and ${transactions.length} transactions.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
