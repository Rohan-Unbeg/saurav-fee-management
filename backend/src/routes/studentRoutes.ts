import express from 'express';
import multer from 'multer';
import { getStudents, createStudent, updateStudent, deleteStudent, getStudentById } from '../controllers/studentController';
import validate from '../middleware/validateResource';
import { createStudentSchema, updateStudentSchema } from '../validators/studentValidators';

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

import { checkRole } from '../middleware/checkRole';

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', upload.single('photo'), validate(createStudentSchema), createStudent);
router.put('/:id', upload.single('photo'), validate(updateStudentSchema), updateStudent);
router.delete('/:id', checkRole(['admin']), deleteStudent);

export default router;
