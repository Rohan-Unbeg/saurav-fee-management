import express from 'express';
import multer from 'multer';
import path from 'path';
import { getStudents, createStudent, updateStudent, deleteStudent, getStudentById } from '../controllers/studentController';

import { studentValidation } from '../validators/studentValidators';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', upload.single('photo'), studentValidation, validateRequest, createStudent);
router.put('/:id', upload.single('photo'), studentValidation, validateRequest, updateStudent);
router.delete('/:id', deleteStudent);

export default router;
