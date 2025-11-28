import express from 'express';
import { login, register } from '../controllers/authController';

const router = express.Router();

import User from '../models/User';
import bcrypt from 'bcryptjs';

router.post('/register', register);
router.post('/login', login);

// Temporary Seed Route (For initial setup)
router.get('/seed', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      res.send('Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      name: 'Admin User'
    });

    await admin.save();
    res.send('Admin user created successfully! You can now login.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error seeding admin');
  }
});

export default router;
