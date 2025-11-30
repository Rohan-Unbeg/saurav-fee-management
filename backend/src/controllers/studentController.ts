import { Request, Response } from 'express';
import Student from '../models/Student';
import Course from '../models/Course';
import { logAudit } from '../utils/auditLogger';
import { AuthRequest } from '../middleware/authMiddleware';

export const getStudents = async (req: Request, res: Response) => {
  try {
    // Check if pagination params are provided
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const search = req.query.search as string;
      const batch = req.query.batch as string;
      const filter: any = { isDeleted: false };

      if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { studentMobile: searchRegex }
        ];
      }

      if (batch) {
        filter.batch = { $regex: batch, $options: 'i' };
      }

      if (req.query.defaulters === 'true') {
        filter.pendingAmount = { $gt: 0 };
      }

      const students = await Student.find(filter)
        .populate('courseId', 'name')
        .skip(skip)
        .limit(limit)
        .sort(search ? { firstName: 1 } : { pendingAmount: -1, createdAt: -1 });
        
      const total = await Student.countDocuments(filter);

      const response = {
        data: students,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
      return res.json(response);
    }

    // Default behavior: Return all students (Backward Compatibility)
    const students = await Student.find({ isDeleted: false })
      .populate('courseId', 'name')
      .sort({ pendingAmount: -1, createdAt: -1 });
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
      admissionDate, totalFeeCommitted, discount, nextInstallmentDate
    } = req.body;

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // Calculate fees
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const finalFee = Number(totalFeeCommitted) || course.standardFee;
    const pendingAmount = finalFee; // Initially pending is total

    const student = new Student({
      firstName, lastName, photoUrl, dob, gender, address,
      studentMobile, parentMobile, courseId, batch,
      admissionDate, totalFeeCommitted: finalFee, totalPaid: 0, pendingAmount,
      status: 'Unpaid',
      nextInstallmentDate
    });

    const createdStudent = await student.save();
    
    await logAudit('CREATE', 'Student', (createdStudent._id as any).toString(), (req as AuthRequest).user?.id, { name: `${createdStudent.firstName} ${createdStudent.lastName}` });

    res.status(201).json(createdStudent);
  } catch (error: any) {
    if (error.code === 11000) {
      // Check if it's the compound index error
      if (error.keyPattern && error.keyPattern.studentMobile && error.keyPattern.courseId) {
        return res.status(400).json({ message: 'Student is already enrolled in this course.' });
      }
      
      const field = Object.keys(error.keyValue)[0];
      const message = `${field} already exists.`;
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
      
      // Capture old fee before applying updates
      const oldFee = student.totalFeeCommitted;
      
      Object.assign(student, updateData);
      
      // Check if fee has changed
      if (req.body.totalFeeCommitted !== undefined) {
        const newFee = Number(req.body.totalFeeCommitted);
        // We compare against the *captured* oldFee, not the one in 'student' which might have been updated by Object.assign
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
      const message = `${field} already exists.`;
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
