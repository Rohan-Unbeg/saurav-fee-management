import express from 'express';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken); // Protect all expense routes

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);

export default router;
