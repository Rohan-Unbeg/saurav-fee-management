import { Request, Response } from 'express';
import Course from '../models/Course';

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { name, duration, standardFee } = req.body;
    const course = new Course({ name, duration, standardFee });
    const createdCourse = await course.save();
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
    const course = await Course.findById(id);
    if (course) {
      await course.deleteOne();
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
