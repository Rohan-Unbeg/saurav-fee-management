import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export interface AuthRequest extends Request {
  user?: any;
}

import User from '../models/User';

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if user still exists in DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    console.error('JWT Verification Error:', error.message);
    res.status(403).json({ message: 'Invalid token.', error: error.message });
  }
};
