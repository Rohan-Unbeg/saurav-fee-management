import express from 'express';
import { getTransactions, createTransaction } from '../controllers/transactionController';

const router = express.Router();

import validate from '../middleware/validateResource';
import { createTransactionSchema } from '../validators/transactionValidators';

router.route('/').get(getTransactions).post(validate(createTransactionSchema), createTransaction);

export default router;
