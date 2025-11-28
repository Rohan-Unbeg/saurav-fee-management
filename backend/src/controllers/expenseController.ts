import { Request, Response } from 'express';
import Expense from '../models/Expense';

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { title, amount, category, date, description } = req.body;
    const expense = new Expense({
      title,
      amount,
      category,
      date: date || new Date(),
      description
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Expense.findByIdAndDelete(id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
