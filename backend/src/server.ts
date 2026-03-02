import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config/env';
import { prisma } from './config/prisma';
import { globalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import adultRoutes from './routes/adult.routes';
import streakRoutes from './routes/streak.routes';
import moodRoutes from './routes/mood.routes';
import moduleRoutes from './routes/module.routes';
import chatRoutes from './routes/chat.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

// ── Security & Core Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(globalLimiter);

// ── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Male Parikshan API', timestamp: new Date().toISOString() });
});

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/adult', adultRoutes);
app.use('/streak', streakRoutes);
app.use('/mood', moodRoutes);
app.use('/modules', moduleRoutes);
app.use('/chat', chatRoutes);
app.use('/dashboard', dashboardRoutes);

// ── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(config.port, () => {
      console.log(`\n🚀 Male Parikshan API running on port ${config.port}`);
      console.log(`📖 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n👋 Server shut down gracefully');
  process.exit(0);
});

start();
