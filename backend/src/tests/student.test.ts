import request from 'supertest';
import app from '../app';
import Student from '../models/Student';
import Course from '../models/Course';
import User from '../models/User';
import bcrypt from 'bcryptjs';

let token: string;
let courseId: string;

describe('Student Endpoints', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    });
    await admin.save();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123',
      });
    token = loginRes.body.token;

    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Course',
        duration: '3 Months',
        standardFee: 10000,
      });
    courseId = (courseRes.body._id as any).toString();
  });

  beforeEach(async () => {
    await Student.deleteMany({});
  });

  it('should create a new student', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        dob: '2000-01-01',
        gender: 'Male',
        address: '123 Main St',
        studentMobile: '1234567890',
        parentMobile: '0987654321',
        courseId: courseId,
        batch: 'Morning',
        admissionDate: '2023-01-01',
        totalFeeCommitted: 10000,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('firstName', 'John');
  });

  it('should get all students', async () => {
    await Student.create({
      firstName: 'Jane',
      lastName: 'Doe',
      studentMobile: '1111111111',
      courseId: courseId,
      totalFeeCommitted: 10000,
      totalPaid: 0,
      pendingAmount: 10000,
      status: 'Unpaid',
      address: '456 Elm St',
      dob: new Date('2001-01-01'),
      gender: 'Female',
      parentMobile: '1111111112',
      batch: 'Evening'
    });
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
  });
});
