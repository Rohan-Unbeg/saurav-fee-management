import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET as string;

import { logAudit } from '../utils/auditLogger';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;
    console.log('Register Request:', { username, passwordProvided: !!password, role });

    // Password Strength Validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter.' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one lowercase letter.' });
    }
    if (!/\d/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one number.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: `User '${username}' already exists.` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Use the role from body, defaulting to 'staff' if not provided (or whatever logic you prefer)
    // Note: User model defaults to 'admin', but here we want to respect the requested role.
    const user = new User({ 
      username, 
      password: hashedPassword,
      role: role || 'staff' 
    });
    await user.save();
    
    await logAudit('REGISTER', 'User', (user._id as any).toString(), undefined, { username });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    await logAudit('LOGIN', 'User', (user._id as any).toString(), (user._id as any).toString());
    
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting self
    if (id === (req as any).user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToDelete.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot delete Super Admin' });
    }

    await User.findByIdAndDelete(id);

    await logAudit('DELETE', 'User', id, (req as any).user.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify Old Password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    // Validate New Password Strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.' 
      });
    }

    // Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await logAudit('UPDATE', 'User', userId, userId, { action: 'Password Change' });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
