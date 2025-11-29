import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dob: z.string().transform((str) => new Date(str)),
    gender: z.enum(['Male', 'Female', 'Other']),
    address: z.string().min(1, 'Address is required'),
    studentMobile: z.string().regex(/^[0-9]{10}$/, 'Student mobile number must be exactly 10 digits'),
    parentMobile: z.string().regex(/^[0-9]{10}$/, 'Parent mobile number must be exactly 10 digits'),
    courseId: z.string().min(1, 'Course ID is required'),
    batch: z.string().min(1, 'Batch is required'),
    totalFeeCommitted: z.number().min(0, 'Total fee cannot be negative'),
    admissionDate: z.string().optional().transform((str) => str ? new Date(str) : new Date()),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    dob: z.string().optional().transform((str) => str ? new Date(str) : undefined),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    address: z.string().optional(),
    studentMobile: z.string().regex(/^[0-9]{10}$/).optional(),
    parentMobile: z.string().regex(/^[0-9]{10}$/).optional(),
    courseId: z.string().optional(),
    batch: z.string().optional(),
    totalFeeCommitted: z.number().min(0).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Student ID is required'),
  }),
});
