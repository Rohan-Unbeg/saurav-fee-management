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
    const users = await User.find();
    const counters = await Counter.find();

    res.json({
      courses,
      students,
      transactions,
      expenses,
      users,
      counters,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/import', async (req, res) => {
  try {
    const { courses, students, transactions, expenses, users, counters } = req.body;

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
    if (users) {
      await User.deleteMany({});
      await User.insertMany(users);
    }
    if (counters) {
      await Counter.deleteMany({});
      await Counter.insertMany(counters);
    }

    res.json({ message: 'Data imported successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

import fs from 'fs';
import path from 'path';
import Counter from '../models/Counter';
import User from '../models/User';

const BACKUP_DIR = path.join(__dirname, '../../backups');

router.get('/list', async (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json([]);
    }
    const backups = fs.readdirSync(BACKUP_DIR).filter(file => {
      return fs.statSync(path.join(BACKUP_DIR, file)).isDirectory();
    }).sort().reverse(); // Newest first
    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/restore/:timestamp', async (req, res) => {
  try {
    const { timestamp } = req.params;
    const backupDir = path.join(BACKUP_DIR, timestamp);
    const fullBackupPath = path.join(backupDir, 'full_backup.json');

    let data;

    if (fs.existsSync(fullBackupPath)) {
      data = JSON.parse(fs.readFileSync(fullBackupPath, 'utf-8'));
    } else if (fs.existsSync(backupDir)) {
      // Fallback for legacy backups (individual files)
      data = {
        courses: fs.existsSync(path.join(backupDir, 'courses.json')) ? JSON.parse(fs.readFileSync(path.join(backupDir, 'courses.json'), 'utf-8')) : [],
        students: fs.existsSync(path.join(backupDir, 'students.json')) ? JSON.parse(fs.readFileSync(path.join(backupDir, 'students.json'), 'utf-8')) : [],
        transactions: fs.existsSync(path.join(backupDir, 'transactions.json')) ? JSON.parse(fs.readFileSync(path.join(backupDir, 'transactions.json'), 'utf-8')) : [],
        expenses: fs.existsSync(path.join(backupDir, 'expenses.json')) ? JSON.parse(fs.readFileSync(path.join(backupDir, 'expenses.json'), 'utf-8')) : [],
        counters: fs.existsSync(path.join(backupDir, 'counters.json')) ? JSON.parse(fs.readFileSync(path.join(backupDir, 'counters.json'), 'utf-8')) : [],
        users: fs.existsSync(path.join(backupDir, 'users.json')) ? JSON.parse(fs.readFileSync(path.join(backupDir, 'users.json'), 'utf-8')) : [],
      };
    } else {
      return res.status(404).json({ message: 'Backup not found' });
    }

    const { courses, students, transactions, expenses, counters, users } = data;

    // Restore logic
    if (courses) { await Course.deleteMany({}); await Course.insertMany(courses); }
    if (students) { await Student.deleteMany({}); await Student.insertMany(students); }
    if (transactions) { await Transaction.deleteMany({}); await Transaction.insertMany(transactions); }
    if (expenses) { await Expense.deleteMany({}); await Expense.insertMany(expenses); }
    if (counters) { await Counter.deleteMany({}); await Counter.insertMany(counters); }
    if (users) { await User.deleteMany({}); await User.insertMany(users); }

    res.json({ message: 'System restored successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
