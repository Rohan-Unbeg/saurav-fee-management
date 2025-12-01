import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/User';
import Course from '../src/models/Course';
import Student from '../src/models/Student';
import Transaction from '../src/models/Transaction';
import Expense from '../src/models/Expense';
import Counter from '../src/models/Counter';

dotenv.config({ path: path.join(__dirname, '../.env') });

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Anvi', 'Myra', 'Riya', 'Aarohi', 'Sia'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Yadav', 'Jain', 'Shah', 'Mishra', 'Deshmukh', 'Joshi', 'Kulkarni', 'Patil', 'Pawar', 'Shinde', 'More', 'Gaikwad'];
const batches = ['January 2025', 'February 2025', 'March 2025', 'October 2024', 'November 2024', 'December 2024'];

const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected.');

    // 1. Wipe Database
    console.log('Wiping database...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Student.deleteMany({});
    await Transaction.deleteMany({});
    await Expense.deleteMany({});
    await Counter.deleteMany({});

    // 2. Create Users
    console.log('Creating users...');
    const superAdminPassword = await bcrypt.hash('Super@Rohan2025!', 10);
    const adminPassword = await bcrypt.hash('Amol@1234#', 10);

    // Super Admin (Rohan)
    await User.create({
      username: 'rohanunbeg',
      password: superAdminPassword,
      role: 'admin',
      isSuperAdmin: true
    });

    // Admin (Amol)
    await User.create({
      username: 'amolsarade',
      password: adminPassword,
      role: 'admin',
      isSuperAdmin: false
    });

    // 3. Create Courses
    console.log('Creating courses...');
    const courses = await Course.insertMany([
      { name: 'MSCIT', duration: '3 Months', standardFee: 5000 },
      { name: 'GCC TBC', duration: '6 Months', standardFee: 19500 },
      { name: 'MKCL Klick', duration: '3 Months', standardFee: 4500 }
    ]);

    // 4. Generate Students & Transactions
    console.log('Generating students and transactions...');
    const students: any[] = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // Last 6 months

    for (let i = 0; i < 50; i++) {
      const course = getRandomElement(courses);
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const batch = getRandomElement(batches);
      const admissionDate = getRandomDate(startDate, new Date());
      
      const totalFee = course.standardFee;
      let totalPaid = 0;
      let status = getRandomElement(['Paid', 'Paid', 'Partial', 'Partial', 'Partial']);

      if (status === 'Paid') {
        totalPaid = totalFee;
      } else {
        const minPay = Math.max(1000, totalFee * 0.2);
        const maxPay = totalFee * 0.8;
        totalPaid = Math.floor((Math.random() * (maxPay - minPay) + minPay) / 500) * 500;
      }

      const pendingAmount = totalFee - totalPaid;
      
      const student = await Student.create({
        firstName, lastName,
        studentMobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        parentMobile: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
        dob: getRandomDate(new Date('2000-01-01'), new Date('2010-01-01')),
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        address: 'Pune, Maharashtra',
        courseId: course._id,
        batch,
        admissionDate,
        totalFeeCommitted: totalFee,
        totalPaid,
        pendingAmount,
        status: pendingAmount <= 0 ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Unpaid'),
        isDeleted: false,
        nextInstallmentDate: pendingAmount > 0 ? new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 30))) : undefined
      });
      students.push(student);

      if (totalPaid > 0) {
        let remainingToRecord = totalPaid;
        const initialPayment = Math.min(remainingToRecord, Math.floor((Math.random() * 2000 + 1000) / 500) * 500);
        
        await Transaction.create({
          studentId: (student as any)._id,
          amount: initialPayment,
          mode: getRandomElement(['Cash', 'UPI', 'Cash', 'UPI', 'Cheque']),
          receiptNo: `REC-ADM-${Math.floor(10000 + Math.random() * 90000)}`,
          date: admissionDate,
          remark: 'Admission Fee'
        });

        remainingToRecord -= initialPayment;

        if (remainingToRecord > 0) {
          const numInstallments = Math.floor(Math.random() * 3) + 1;
          for (let k = 0; k < numInstallments; k++) {
            if (remainingToRecord <= 0) break;
            const installmentAmount = k === numInstallments - 1 ? remainingToRecord : Math.floor((remainingToRecord / numInstallments) / 500) * 500;
            const finalAmount = installmentAmount <= 0 ? remainingToRecord : installmentAmount;
            const installmentDate = getRandomDate(admissionDate, new Date());

            await Transaction.create({
              studentId: (student as any)._id,
              amount: finalAmount,
              mode: getRandomElement(['Cash', 'UPI']),
              receiptNo: `REC-INST-${Math.floor(10000 + Math.random() * 90000)}`,
              date: installmentDate,
              remark: `Installment #${k + 1}`
            });

            remainingToRecord -= finalAmount;
          }
        }
      }
    }

    // 5. Generate Expenses
    console.log('Generating expenses...');
    const expenseCategories = ['Rent', 'Electricity', 'Internet', 'Staff Salary', 'Maintenance', 'Stationery'];
    for (let i = 0; i < 20; i++) {
      await Expense.create({
        title: getRandomElement(expenseCategories),
        amount: Math.floor(Math.random() * 5000) + 500,
        category: 'Operational',
        date: getRandomDate(startDate, new Date()),
        description: 'Monthly expense'
      });
    }

    console.log('Seed completed successfully! 🌱');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
