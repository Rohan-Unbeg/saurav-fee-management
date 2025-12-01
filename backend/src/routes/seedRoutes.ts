import express from 'express';
import { seedDatabase, clearSeedData, clearStudents } from '../controllers/seedController';

const router = express.Router();

router.post('/', seedDatabase);
router.delete('/', clearSeedData);
router.delete('/students', clearStudents);

export default router;
