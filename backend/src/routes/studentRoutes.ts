import express from 'express';
import multer from 'multer';
import { getStudents, createStudent, updateStudent, deleteStudent, getStudentById } from '../controllers/studentController';
import validate from '../middleware/validateResource';
import { createStudentSchema, updateStudentSchema } from '../validators/studentValidators';

const router = express.Router();

// Configure multer for file upload
import { storage } from '../config/cloudinary';
const upload = multer({ 
  storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

import { checkRole } from '../middleware/checkRole';

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', upload.single('photo'), validate(createStudentSchema), createStudent);
router.put('/:id', upload.single('photo'), validate(updateStudentSchema), updateStudent);
router.delete('/:id', checkRole(['admin']), deleteStudent);

export default router;
