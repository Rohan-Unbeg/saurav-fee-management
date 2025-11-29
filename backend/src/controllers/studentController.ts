import { Request, Response } from 'express';
import Student from '../models/Student';
import Course from '../models/Course';
import { logAudit } from '../utils/auditLogger';
import { AuthRequest } from '../middleware/authMiddleware';

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find({ isDeleted: false }).populate('courseId', 'name');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, isDeleted: false }).populate('courseId', 'name');
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
      admissionDate, totalFeeCommitted, discount
    } = req.body;

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // Calculate fees
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const finalFee = totalFeeCommitted || course.standardFee;
    const pendingAmount = finalFee; // Initially pending is total

    const student = new Student({
      firstName, lastName, photoUrl, dob, gender, address,
      studentMobile, parentMobile, courseId, batch,
      admissionDate, totalFeeCommitted: finalFee, totalPaid: 0, pendingAmount,
      status: 'Unpaid'
    });

    const createdStudent = await student.save();
    
    await logAudit('CREATE', 'Student', (createdStudent._id as any).toString(), (req as AuthRequest).user?.id, { name: `${createdStudent.firstName} ${createdStudent.lastName}` });

    res.status(201).json(createdStudent);
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const message = field === 'studentMobile' 
        ? 'This student mobile number is already registered.' 
        : `${field} already exists.`;
      return res.status(400).json({ message });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (student) {
      const updateData = req.body;
      if (req.file) {
        updateData.photoUrl = `/uploads/${req.file.filename}`;
      }
      
      Object.assign(student, updateData);
      
      if (req.body.totalFeeCommitted) {
        const oldFee = student.totalFeeCommitted;
        const newFee = Number(req.body.totalFeeCommitted);
        if (oldFee !== newFee) {
          student.totalFeeCommitted = newFee;
          student.pendingAmount = newFee - student.totalPaid;
          student.status = student.pendingAmount <= 0 ? 'Paid' : (student.totalPaid > 0 ? 'Partial' : 'Unpaid');
        }
      }

      const updatedStudent = await student.save();
      
      await logAudit('UPDATE', 'Student', (updatedStudent._id as any).toString(), (req as AuthRequest).user?.id, updateData);

      res.json(updatedStudent);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const message = field === 'studentMobile' 
        ? 'This student mobile number is already registered.' 
        : `${field} already exists.`;
      return res.status(400).json({ message });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (student) {
      student.isDeleted = true;
      await student.save();
      
      await logAudit('DELETE', 'Student', id, (req as AuthRequest).user?.id);

      res.json({ message: 'Student removed' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
