import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import Student from '../models/Student';
import mongoose from 'mongoose';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    const filter: any = {};
    
    if (studentId) filter.studentId = studentId;
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    const transactions = await Transaction.find(filter).populate('studentId', 'firstName lastName').sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { studentId, amount, mode, transactionReferenceId, remark } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (amount > student.pendingAmount) {
      return res.status(400).json({ message: 'Amount exceeds pending balance' });
    }

    // Generate Receipt No (Simple timestamp based for now, can be improved)
    const receiptNo = `REC-${Date.now()}`;

    // Auto-generate Installment Remark
    const previousTransactionCount = await Transaction.countDocuments({ studentId });
    const installmentNo = previousTransactionCount + 1;
    const autoRemark = `Installment ${installmentNo}`;

    const transaction = new Transaction({
      studentId,
      amount,
      mode,
      transactionReferenceId,
      remark: remark || autoRemark,
      receiptNo
    });

    await transaction.save();

    // Update Student Financials
    student.totalPaid += Number(amount);
    student.pendingAmount -= Number(amount);
    
    if (student.pendingAmount === 0) {
      student.status = 'Paid';
    } else {
      student.status = 'Partial';
    }

    await student.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
