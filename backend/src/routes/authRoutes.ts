import express from 'express';
import { login, register } from '../controllers/authController';

const router = express.Router();

import User from '../models/User';
import bcrypt from 'bcryptjs';

import validate from '../middleware/validateResource';
import { registerSchema, loginSchema } from '../validators/authValidators';

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

import { authenticateToken } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/checkRole';
import { getUsers, deleteUser, changePassword } from '../controllers/authController';

router.put('/change-password', authenticateToken, changePassword);
router.get('/users', authenticateToken, checkRole(['admin']), getUsers);
router.delete('/users/:id', authenticateToken, checkRole(['admin']), deleteUser);

// Temporary Seed Route (For initial setup)
router.get('/seed', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      res.send('Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      name: 'Admin User'
    });

    await admin.save();
    res.send('Admin user created successfully! You can now login.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error seeding admin');
  }
});

import Course from '../models/Course';
import Student from '../models/Student';

// Demo Data Seed Route
router.get('/seed-demo', async (req, res) => {
  try {
    // 1. Create Courses
    const courses = [
      { name: 'MS-CIT', duration: '3 Months', standardFee: 4500 },
      { name: 'Tally Prime', duration: '2 Months', standardFee: 3500 },
      { name: 'Python Programming', duration: '3 Months', standardFee: 6000 }
    ];

    const createdCourses = [];
    for (const c of courses) {
      let course = await Course.findOne({ name: c.name });
      if (!course) {
        course = await Course.create(c);
      }
      createdCourses.push(course);
    }

    // 2. Create Students
    const students = [
      {
        firstName: 'Rahul', lastName: 'Sharma', dob: new Date('2005-05-15'), gender: 'Male',
        address: 'Shivaji Nagar, Pune', studentMobile: '9876543210', parentMobile: '9876543211',
        courseId: createdCourses[0]._id as any, batch: 'Morning 8-9',
        totalFeeCommitted: 4500, totalPaid: 2000, pendingAmount: 2500, status: 'Partial'
      },
      {
        firstName: 'Priya', lastName: 'Patil', dob: new Date('2006-08-20'), gender: 'Female',
        address: 'Kothrud, Pune', studentMobile: '9123456789', parentMobile: '9123456780',
        courseId: createdCourses[1]._id as any, batch: 'Evening 6-7',
        totalFeeCommitted: 3500, totalPaid: 3500, pendingAmount: 0, status: 'Paid'
      },
      {
        firstName: 'Amit', lastName: 'Verma', dob: new Date('2004-12-10'), gender: 'Male',
        address: 'Hadapsar, Pune', studentMobile: '9988776655', parentMobile: '9988776644',
        courseId: createdCourses[2]._id as any, batch: 'Weekend',
        totalFeeCommitted: 6000, totalPaid: 0, pendingAmount: 6000, status: 'Unpaid'
      }
    ];

    for (const s of students) {
      const exists = await Student.findOne({ studentMobile: s.studentMobile });
      if (!exists) {
        await Student.create(s);
      }
    }

    // 3. Create Transactions (for Chart Data)
    const Transaction = (await import('../models/Transaction')).default;
    
    // Clear existing transactions to avoid duplicates if re-seeded
    // await Transaction.deleteMany({}); 

    const transactions: any[] = [
      {
        studentId: (await Student.findOne({ studentMobile: '9876543210' }))?._id,
        amount: 2000,
        date: new Date(), // Today
        mode: 'Cash',
        receiptNo: 'REC-001',
        remark: 'First Installment'
      },
      {
        studentId: (await Student.findOne({ studentMobile: '9123456789' }))?._id,
        amount: 3500,
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last Month
        mode: 'UPI',
        receiptNo: 'REC-002',
        remark: 'Full Payment'
      },
      {
        studentId: (await Student.findOne({ studentMobile: '9876543210' }))?._id,
        amount: 1000,
        date: new Date(new Date().setMonth(new Date().getMonth() - 2)), // 2 Months Ago
        mode: 'Cash',
        receiptNo: 'REC-003',
        remark: 'Registration Fee'
      }
    ];

    for (const t of transactions) {
      if (t.studentId) {
        const exists = await Transaction.findOne({ receiptNo: t.receiptNo });
        if (!exists) {
          await Transaction.create(t);
        }
      }
    }

    res.send('Demo data (Courses & Students) created successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error seeding demo data');
  }
});

export default router;
