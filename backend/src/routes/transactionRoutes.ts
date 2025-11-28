import express from 'express';
import { getTransactions, createTransaction } from '../controllers/transactionController';

const router = express.Router();

router.route('/').get(getTransactions).post(createTransaction);

export default router;
