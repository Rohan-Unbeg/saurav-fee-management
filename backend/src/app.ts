import express from 'express';
import cors from 'cors';
import path from 'path';

import morgan from 'morgan';
import logger from './utils/logger';
import connectDB from './config/db';
import courseRoutes from './routes/courseRoutes';
import studentRoutes from './routes/studentRoutes';
import transactionRoutes from './routes/transactionRoutes';
import statsRoutes from './routes/statsRoutes';
import authRoutes from './routes/authRoutes';
import expenseRoutes from './routes/expenseRoutes';
import backupRoutes from './routes/backupRoutes';
import seedRoutes from './routes/seedRoutes';
import { authenticateToken } from './middleware/authMiddleware';
import { globalErrorHandler } from './middleware/errorMiddleware';
import { AppError } from './utils/AppError';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore
import xss from 'xss-clean';

const app = express();

// Trust proxy (Required for Render/Heroku)
app.set('trust proxy', 1);

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow frontend origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Set security HTTP headers
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(xss()); // Data sanitization against XSS

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' })); // Limit body size
const morganFormat = ':method :url :status :res[content-length] - :response-time ms';

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(' ')[0],
          url: message.split(' ')[1],
          status: message.split(' ')[2],
          responseTime: message.split(' ')[5],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', authenticateToken, courseRoutes);
app.use('/api/students', authenticateToken, studentRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);
app.use('/api/stats', authenticateToken, statsRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/seed', seedRoutes);

// Handle Unhandled Routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
// Trigger restart 2
