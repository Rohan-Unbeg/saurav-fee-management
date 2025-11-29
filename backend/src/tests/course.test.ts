import request from 'supertest';
import app from '../app';
import Course from '../models/Course';
import User from '../models/User';
import bcrypt from 'bcryptjs';

let token: string;

describe('Course Endpoints', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    });
    await admin.save();

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123',
      });
    token = res.body.token;
  });

  beforeEach(async () => {
    await Course.deleteMany({});
  });

  it('should create a new course', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Course',
        duration: '3 Months',
        standardFee: 10000,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Test Course');
  });

  it('should get all courses', async () => {
    await Course.create({ name: 'Course 1', duration: '1 Month', standardFee: 5000 });
    const res = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
  });
});
