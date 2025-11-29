import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Course from './models/Course';
import Student from './models/Student';
import Transaction from './models/Transaction';
import Expense from './models/Expense';

dotenv.config();

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Anvi', 'Myra', 'Riya', 'Aaradhya', 'Kiara'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Mehta', 'Patel', 'Singh', 'Kumar', 'Das', 'Chopra', 'Reddy', 'Nair', 'Kapoor', 'Jain', 'Malhotra', 'Bhat'];
const expenseCategories = ['Rent', 'Electricity', 'Internet', 'Staff Salary', 'Maintenance', 'Office Supplies', 'Marketing'];

const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const seedDemoData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Fetch Courses
    const courses = await Course.find();
    if (courses.length === 0) {
      console.error('No courses found. Please run the main seed script first.');
      process.exit(1);
    }

    console.log('Generating dummy data...');

    // 1. Create Students & Transactions
    const students = [];
    const transactions = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // 6 months ago

    for (let i = 0; i < 30; i++) {
      // Ensure different courses for the first two students who share a mobile
      let course = getRandomElement(courses);
      if (i === 0) course = courses[0];
      if (i === 1) course = courses[1] || courses[0]; // Fallback if only 1 course exists (unlikely)
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      // For the first two students, use the SAME mobile number to demonstrate multiple enrollments
      const mobile = i < 2 ? '9999999999' : `9${getRandomInt(100000000, 999999999)}`;
      
      const admissionDate = getRandomDate(startDate, new Date());
      const totalFee = course.standardFee;
      
      // Determine Payment Status
      const rand = Math.random();
      let paid = 0;
      let status: 'Paid' | 'Partial' | 'Unpaid' = 'Unpaid';

      if (rand > 0.6) {
        paid = totalFee;
        status = 'Paid';
      } else if (rand > 0.3) {
        paid = Math.floor(totalFee / 2);
        status = 'Partial';
      }

      const student = new Student({
        firstName,
        lastName,
        studentMobile: mobile,
        parentMobile: `8${getRandomInt(100000000, 999999999)}`,
        courseId: course._id,
        batch: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][getRandomInt(0, 5)]} 2025`,
        dob: getRandomDate(new Date(2000, 0, 1), new Date(2005, 11, 31)),
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        address: 'Demo Address, City',
        admissionDate,
        totalFeeCommitted: totalFee,
        totalPaid: paid,
        pendingAmount: totalFee - paid,
        status,
        isDeleted: false
      });

      students.push(student);

      // Create Transaction if paid
      if (paid > 0) {
        // Split payment into 1 or 2 transactions
        const numTxns = (status === 'Paid' && Math.random() > 0.5) ? 2 : 1;
        let remainingPaid = paid;

        for (let j = 0; j < numTxns; j++) {
          const amount = j === numTxns - 1 ? remainingPaid : Math.floor(remainingPaid / 2);
          remainingPaid -= amount;

          transactions.push(new Transaction({
            studentId: student._id,
            amount,
            mode: Math.random() > 0.7 ? 'UPI' : 'Cash',
            date: getRandomDate(admissionDate, new Date()),
            receiptNo: `REC-${Date.now()}-${i}-${j}`,
            remark: 'Demo Fee Payment'
          }));
        }
      }
    }

    await Student.insertMany(students);
    // Need to update student IDs in transactions because we created instances but didn't save them individually to get IDs? 
    // Mongoose assigns _id on instantiation, so student._id should be valid.
    await Transaction.insertMany(transactions);
    console.log(`Created ${students.length} students and ${transactions.length} transactions.`);

    // 2. Create Expenses
    const expenses = [];
    for (let i = 0; i < 20; i++) {
      expenses.push(new Expense({
        title: getRandomElement(expenseCategories),
        amount: getRandomInt(500, 15000),
        category: getRandomElement(expenseCategories),
        date: getRandomDate(startDate, new Date()),
        description: 'Demo Expense Entry'
      }));
    }

    await Expense.insertMany(expenses);
    console.log(`Created ${expenses.length} expenses.`);

    console.log('Demo data seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo data:', error);
    process.exit(1);
  }
};

seedDemoData();
