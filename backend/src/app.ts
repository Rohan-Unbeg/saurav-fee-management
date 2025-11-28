import express from 'express';
import cors from 'cors';
import path from 'path';

import morgan from 'morgan';
import connectDB from './config/db';
import courseRoutes from './routes/courseRoutes';
import studentRoutes from './routes/studentRoutes';
import transactionRoutes from './routes/transactionRoutes';
import statsRoutes from './routes/statsRoutes';
import authRoutes from './routes/authRoutes';
import expenseRoutes from './routes/expenseRoutes';
import backupRoutes from './routes/backupRoutes';
import { authenticateToken } from './middleware/authMiddleware';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore
import xss from 'xss-clean';

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(xss()); // Data sanitization against XSS

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', authenticateToken, courseRoutes);
app.use('/api/students', authenticateToken, studentRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);
app.use('/api/stats', authenticateToken, statsRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/backup', backupRoutes);

export default app;
