import { Request, Response } from 'express';
import Course from '../models/Course';
import Student from '../models/Student';

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find({ isDeleted: false });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

import { logAudit } from '../utils/auditLogger';
import { AuthRequest } from '../middleware/authMiddleware';

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { name, duration, standardFee } = req.body;
    const course = new Course({ name, duration, standardFee });
    const createdCourse = await course.save();
    
    await logAudit('CREATE', 'Course', (createdCourse._id as any).toString(), (req as AuthRequest).user?.id, { name });
    
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (course) {
      course.name = req.body.name || course.name;
      course.duration = req.body.duration || course.duration;
      course.standardFee = req.body.standardFee || course.standardFee;
      const updatedCourse = await course.save();
      
      await logAudit('UPDATE', 'Course', (updatedCourse._id as any).toString(), (req as AuthRequest).user?.id, req.body);
      
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if any students are enrolled in this course
    const enrolledStudentsCount = await Student.countDocuments({ courseId: id as any });
    if (enrolledStudentsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete course. ${enrolledStudentsCount} student(s) are currently enrolled.` 
      });
    }

    const course = await Course.findById(id);
    if (course) {
      course.isDeleted = true;
      await course.save();
      
      await logAudit('DELETE', 'Course', id, (req as AuthRequest).user?.id);
      
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
