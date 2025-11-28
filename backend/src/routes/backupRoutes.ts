import express from 'express';
import Course from '../models/Course';
import Student from '../models/Student';
import Transaction from '../models/Transaction';
import Expense from '../models/Expense';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/export', async (req, res) => {
  try {
    const courses = await Course.find();
    const students = await Student.find();
    const transactions = await Transaction.find();
    const expenses = await Expense.find();

    res.json({
      courses,
      students,
      transactions,
      expenses,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/import', async (req, res) => {
  try {
    const { courses, students, transactions, expenses } = req.body;

    if (courses) {
      await Course.deleteMany({});
      await Course.insertMany(courses);
    }
    if (students) {
      await Student.deleteMany({});
      await Student.insertMany(students);
    }
    if (transactions) {
      await Transaction.deleteMany({});
      await Transaction.insertMany(transactions);
    }
    if (expenses) {
      await Expense.deleteMany({});
      await Expense.insertMany(expenses);
    }

    res.json({ message: 'Data imported successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
