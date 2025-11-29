import request from 'supertest';
import app from '../app';
import User from '../models/User';
import bcrypt from 'bcryptjs';

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'Password123!',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User created successfully');
  });

  it('should login a user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'Password123!',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'Password123!',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should get all users (admin only)', async () => {
    // Create user first
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const user = await User.create({
      username: 'testuser',
      password: hashedPassword,
      role: 'admin'
    });

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'Password123!',
      });
    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should delete a user (admin only)', async () => {
    // Create admin user
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    await User.create({
      username: 'adminuser',
      password: hashedPassword,
      role: 'admin'
    });

    // Create user to delete
    const userToDelete = await User.create({
      username: 'todelete',
      password: hashedPassword,
      role: 'staff'
    });

    // Login as admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'adminuser',
        password: 'Password123!',
      });
    const token = loginRes.body.token;

    const res = await request(app)
      .delete(`/api/auth/users/${userToDelete._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'User deleted successfully');
  });
});
