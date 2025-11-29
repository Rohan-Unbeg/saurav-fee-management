import express from 'express';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../controllers/courseController';

const router = express.Router();

import validate from '../middleware/validateResource';
import { createCourseSchema, updateCourseSchema } from '../validators/courseValidators';

import { checkRole } from '../middleware/checkRole';

router.route('/').get(getCourses).post(validate(createCourseSchema), createCourse);
router.route('/:id').put(validate(updateCourseSchema), updateCourse).delete(checkRole(['admin']), deleteCourse);

export default router;
