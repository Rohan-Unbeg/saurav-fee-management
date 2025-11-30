import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Course from '../models/Course';
import Student from '../models/Student';
import Transaction from '../models/Transaction';
import Expense from '../models/Expense';
import Counter from '../models/Counter';

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Anvi', 'Myra', 'Riya', 'Aarohi', 'Sia'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Yadav', 'Jain', 'Shah', 'Mishra', 'Deshmukh', 'Joshi', 'Kulkarni', 'Patil', 'Pawar', 'Shinde', 'More', 'Gaikwad'];
const batches = ['January 2025', 'February 2025', 'March 2025', 'October 2024', 'November 2024', 'December 2024'];

const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const seedDatabase = async (req: Request, res: Response) => {
  try {
    // 1. Wipe Database
    await User.deleteMany({});
    await Course.deleteMany({});
    await Student.deleteMany({});
    await Transaction.deleteMany({});
    await Expense.deleteMany({});
    await Counter.deleteMany({});

    // 2. Create Users
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Super Admin
    await User.create({
      username: 'Rohan Unbeg',
      password: hashedPassword,
      role: 'admin',
      isSuperAdmin: true
    });

    // Secondary Admin
    await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      isSuperAdmin: false
    });

    // Staff
    await User.create({
      username: 'staff',
      password: hashedPassword,
      role: 'staff',
      isSuperAdmin: false
    });

    // 3. Create Courses
    const courses = await Course.insertMany([
      { name: 'MSCIT', duration: '3 Months', standardFee: 4500 },
      { name: 'GCC-TBC', duration: '3 Months', standardFee: 3500 },
      { name: 'MKCL Klick Course', duration: '2 Months', standardFee: 4000 }
    ]);

    // 4. Generate Students & Transactions
    const students: any[] = [];
    const transactions = [];
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
      let status = getRandomElement(['Paid', 'Partial', 'Unpaid', 'Partial', 'Paid']); // Weighted slightly towards paying students

      if (status === 'Paid') totalPaid = totalFee;
      else if (status === 'Partial') totalPaid = Math.floor(Math.random() * (totalFee - 500) / 500) * 500 + 500; // Random multiple of 500
      else totalPaid = 0;

      const pendingAmount = totalFee - totalPaid;
      
      // Create Student
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
        status,
        nextInstallmentDate: pendingAmount > 0 ? new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 30))) : undefined // Next 30 days
      });
      students.push(student);

      // Create Transaction(s)
      if (totalPaid > 0) {
        // If paid fully, maybe 1 or 2 transactions
        const numTx = status === 'Paid' && Math.random() > 0.5 ? 2 : 1;
        let remainingPaid = totalPaid;

        for (let j = 0; j < numTx; j++) {
          const amount = j === numTx - 1 ? remainingPaid : Math.floor(remainingPaid / 2);
          remainingPaid -= amount;
          
          await Transaction.create({
            studentId: (student as any)._id,
            amount,
            mode: getRandomElement(['Cash', 'UPI', 'Cheque']),
            receiptNo: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
            date: getRandomDate(admissionDate, new Date()),
            remark: j === 0 ? 'Admission Fee' : 'Installment'
          });
        }
      }
    }

    // 4.1 Create Multi-Course Students (Same Mobile, Different Course)
    // Pick the first 3 students and enroll them in a different course
    const multiCourseStudents = students.slice(0, 3);
    for (const existingStudent of multiCourseStudents) {
      // Find a course they are NOT enrolled in
      const newCourse = courses.find(c => !c._id.equals(existingStudent.courseId));
      if (!newCourse) continue;

      const totalFee = newCourse.standardFee;
      const student = await Student.create({
        firstName: existingStudent.firstName,
        lastName: existingStudent.lastName,
        studentMobile: existingStudent.studentMobile, // SAME MOBILE
        parentMobile: existingStudent.parentMobile,
        dob: existingStudent.dob,
        gender: existingStudent.gender,
        address: existingStudent.address,
        courseId: newCourse._id, // DIFFERENT COURSE
        batch: getRandomElement(batches),
        admissionDate: new Date(),
        totalFeeCommitted: totalFee,
        totalPaid: 0,
        pendingAmount: totalFee,
        status: 'Unpaid',
        nextInstallmentDate: new Date(new Date().setDate(new Date().getDate() + 7))
      });

      // Add admission fee transaction
      await Transaction.create({
        studentId: (student as any)._id,
        amount: 500,
        mode: 'Cash',
        receiptNo: `REC-MULTI-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date(),
        remark: 'Admission Fee (Second Course)'
      });
    }

    // 5. Generate Expenses
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

    res.json({ message: 'System reset and seeded with realistic data! 🌱' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const clearSeedData = async (req: Request, res: Response) => {
  try {
    // Just wipe everything
    await User.deleteMany({});
    await Course.deleteMany({});
    await Student.deleteMany({});
    await Transaction.deleteMany({});
    await Expense.deleteMany({});
    await Counter.deleteMany({});
    res.json({ message: 'Database wiped completely.' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
