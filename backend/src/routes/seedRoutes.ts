import express from 'express';
import { seedDatabase, clearSeedData } from '../controllers/seedController';

const router = express.Router();

router.post('/', seedDatabase);
router.delete('/', clearSeedData);

export default router;
