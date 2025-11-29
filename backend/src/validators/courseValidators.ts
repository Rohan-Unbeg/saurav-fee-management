import { z } from 'zod';

export const createCourseSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Course name is required'),
    duration: z.string().min(1, 'Duration is required'),
    standardFee: z.number().min(0, 'Fee cannot be negative'),
  }),
});

export const updateCourseSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    duration: z.string().optional(),
    standardFee: z.number().min(0).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Course ID is required'),
  }),
});
