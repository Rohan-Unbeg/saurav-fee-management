import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import Student from '../models/Student';
import Transaction from '../models/Transaction';
import Course from '../models/Course';
import Expense from '../models/Expense';
import Counter from '../models/Counter';
import User from '../models/User';
import { logAudit } from '../utils/auditLogger';

const BACKUP_DIR = path.join(__dirname, '../../backups');

export const performBackup = async () => {
  try {
    console.log('Starting automated backup...');
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, timestamp);
    
    fs.mkdirSync(backupPath);

    // Fetch all data
    const students = await Student.find({});
    const transactions = await Transaction.find({});
    const courses = await Course.find({});
    const expenses = await Expense.find({});
    const counters = await Counter.find({});
    const users = await User.find({});

    // Write to files
    fs.writeFileSync(path.join(backupPath, 'students.json'), JSON.stringify(students, null, 2));
    fs.writeFileSync(path.join(backupPath, 'transactions.json'), JSON.stringify(transactions, null, 2));
    fs.writeFileSync(path.join(backupPath, 'courses.json'), JSON.stringify(courses, null, 2));
    fs.writeFileSync(path.join(backupPath, 'expenses.json'), JSON.stringify(expenses, null, 2));
    fs.writeFileSync(path.join(backupPath, 'counters.json'), JSON.stringify(counters, null, 2));
    fs.writeFileSync(path.join(backupPath, 'users.json'), JSON.stringify(users, null, 2));

    // Create consolidated backup for easy restore
    const fullBackup = {
      courses,
      students,
      transactions,
      expenses,
      counters,
      users,
      timestamp: new Date()
    };
    fs.writeFileSync(path.join(backupPath, 'full_backup.json'), JSON.stringify(fullBackup, null, 2));

    console.log(`Backup completed successfully at ${backupPath}`);
    await logAudit('BACKUP', 'System', 'Backup', 'SYSTEM', { path: backupPath });

  } catch (error) {
    console.error('Backup failed:', error);
  }
};

export const scheduleBackups = () => {
  // Schedule task to run at 00:00 every day
  cron.schedule('0 0 * * *', () => {
    performBackup();
  });
  console.log('Backup scheduler initialized: Running daily at 00:00');
};
