import { Request, Response } from 'express';
import Student from '../models/Student';
import Course from '../models/Course';

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find().populate('courseId', 'name');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id).populate('courseId', 'name');
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const {
      firstName, lastName, dob, gender, address,
      studentMobile, parentMobile, courseId, batch,
      admissionDate, standardFee, discount
    } = req.body;

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // Calculate fees
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const totalFeeCommitted = standardFee || course.standardFee;
    const pendingAmount = totalFeeCommitted; // Initially pending is total

    const student = new Student({
      firstName, lastName, photoUrl, dob, gender, address,
      studentMobile, parentMobile, courseId, batch,
      admissionDate, totalFeeCommitted, totalPaid: 0, pendingAmount,
      status: 'Unpaid'
    });

    const createdStudent = await student.save();
    res.status(201).json(createdStudent);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (student) {
      student.firstName = req.body.firstName || student.firstName;
      student.lastName = req.body.lastName || student.lastName;
      student.dob = req.body.dob || student.dob;
      student.gender = req.body.gender || student.gender;
      student.address = req.body.address || student.address;
      student.studentMobile = req.body.studentMobile || student.studentMobile;
      student.parentMobile = req.body.parentMobile || student.parentMobile;
      student.batch = req.body.batch || student.batch;
      
      if (req.file) {
        student.photoUrl = `/uploads/${req.file.filename}`;
      }

      const updatedStudent = await student.save();
      res.json(updatedStudent);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (student) {
      await student.deleteOne();
      res.json({ message: 'Student removed' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
