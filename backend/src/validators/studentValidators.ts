import { body } from 'express-validator';

export const studentValidation = [
  body('firstName').notEmpty().withMessage('First name is required').trim().escape(),
  body('lastName').notEmpty().withMessage('Last name is required').trim().escape(),
  body('studentMobile')
    .matches(/^[0-9]{10}$/)
    .withMessage('Student mobile number must be exactly 10 digits'),
  body('parentMobile')
    .matches(/^[0-9]{10}$/)
    .withMessage('Parent mobile number must be exactly 10 digits'),
  body('email').optional().isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('totalFeeCommitted').isNumeric().withMessage('Total fee must be a number'),
  body('courseId').notEmpty().withMessage('Course is required')
];
