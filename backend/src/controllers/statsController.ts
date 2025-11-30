import { Request, Response } from 'express';
import Student from '../models/Student';
import Transaction from '../models/Transaction';
import Expense from '../models/Expense';

export const getStats = async (req: Request, res: Response) => {
  try {
    const totalStudents = await Student.countDocuments();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysTransactions = await Transaction.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const todaysCollection = todaysTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    const students = await Student.find();
    const totalPending = students.reduce((acc, curr) => acc + curr.pendingAmount, 0);

    // Calculate Total Collection (All Time)
    const totalCollectionResult = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalCollection = totalCollectionResult[0]?.total || 0;

    // Calculate Total Expenses (All Time)
    const totalExpensesResult = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpenses = totalExpensesResult[0]?.total || 0;

    const netBalance = totalCollection - totalExpenses;

    // Monthly Collection (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Transaction.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const formattedMonthlyStats = monthlyStats.map(item => {
      const date = new Date();
      date.setMonth(item._id.month - 1);
      return {
        name: date.toLocaleString('default', { month: 'short' }),
        total: item.total
      };
    });

    res.json({
      totalStudents,
      todaysCollection,
      totalPending,
      totalExpenses,
      netBalance,
      monthlyStats: formattedMonthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
