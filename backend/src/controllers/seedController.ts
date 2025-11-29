import { Request, Response } from 'express';
import Student from '../models/Student';
import Transaction from '../models/Transaction';
import Course from '../models/Course';

export const seedDatabase = async (req: Request, res: Response) => {
  try {
    const count = 1000;
    const batchYears = ['2024', '2025'];
    const batchMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Get a course ID
    const course = await Course.findOne();
    if (!course) {
      return res.status(400).json({ message: 'Please create at least one course first.' });
    }

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
          receiptNo: `REC-TEST-${i}`,
          remark: 'Seed Data'
        }));
      }
    }

    await Student.insertMany(students);
    await Transaction.insertMany(transactions);

    res.json({ message: `Successfully seeded ${count} students and ${transactions.length} transactions.` });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const clearSeedData = async (req: Request, res: Response) => {
  try {
    await Student.deleteMany({ lastName: 'Test' });
    await Transaction.deleteMany({ remark: 'Seed Data' });
    res.json({ message: 'Cleared all seed data.' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
