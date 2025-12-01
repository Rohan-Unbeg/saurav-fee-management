import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import Student from '../models/Student';
import Counter from '../models/Counter';
import mongoose from 'mongoose';
import { logAudit } from '../utils/auditLogger';
import { AuthRequest } from '../middleware/authMiddleware';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    
    if (studentId) filter.studentId = studentId;
    if (startDate && endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: end
      };
    }

    const transactions = await Transaction.find(filter)
      .populate('studentId', 'firstName lastName isDeleted totalFeeCommitted totalPaid pendingAmount courseId batch')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      data: transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
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

    if (amount < 100) {
      return res.status(400).json({ message: 'Minimum transaction amount is ₹100' });
    }

    if (amount > student.pendingAmount) {
      return res.status(400).json({ message: 'Amount exceeds pending balance' });
    }

    // Generate Receipt No using Counter
    const counter = await Counter.findOneAndUpdate(
      { name: 'receiptNo' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const receiptNo = `REC-${counter.seq.toString().padStart(4, '0')}`;

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

    await logAudit('CREATE', 'Transaction', (transaction._id as any).toString(), (req as AuthRequest).user?.id, { amount, studentId });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
