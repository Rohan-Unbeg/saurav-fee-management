import request from 'supertest';
import app from '../app';
import Transaction from '../models/Transaction';
import Student from '../models/Student';
import Course from '../models/Course';
import User from '../models/User';
import bcrypt from 'bcryptjs';

let token: string;
let studentId: string;

describe('Transaction Endpoints', () => {
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

    const course = await Course.create({ name: 'Test Course', duration: '3 Months', standardFee: 10000 });
    const student = await Student.create({
      firstName: 'John',
      lastName: 'Doe',
      studentMobile: '1234567890',
      courseId: course._id,
      totalFeeCommitted: 10000,
      totalPaid: 0,
      pendingAmount: 10000,
      status: 'Unpaid',
      address: '123 Main St',
      dob: new Date('2000-01-01'),
      gender: 'Male',
      parentMobile: '0987654321',
      batch: 'Morning'
    });
    studentId = (student._id as any).toString();
  });

  beforeEach(async () => {
    await Transaction.deleteMany({});
  });

  it('should create a transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        studentId: studentId,
        amount: 5000,
        mode: 'Cash',
        remark: 'First Installment'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('amount', 5000);
    expect(res.body).toHaveProperty('receiptNo');
  });
});
