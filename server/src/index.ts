import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

import { createResponse } from './utils/createResponse';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json(createResponse(true, { status: 'Server is running' }));
});

// Import route handlers
import fileRoutes from './routes/files';
import quizRoutes from './routes/quiz';
import authRoutes from './routes/auth';
import calendarRoutes from './routes/calendarRoutes';
import eventTagMappingRoutes from './routes/eventTagMappingRoutes';
import tagRecommendationRoutes from './routes/tagRecommendationRoutes';
import { startQuizReminderScheduler } from './services/schedulerService';
import { authenticate } from './middleware/authMiddleware';

app.use('/api', fileRoutes);
app.use('/api', quizRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/calendar-events', authenticate, calendarRoutes);
app.use('/api/event-tag-mappings', authenticate, eventTagMappingRoutes);
app.use('/api/tags', authenticate, tagRecommendationRoutes);

// Start the quiz reminder scheduler (set your quiz page URL here)
const QUIZ_PAGE_URL = process.env.QUIZ_PAGE_URL || 'http://localhost:3000/quiz';
startQuizReminderScheduler(QUIZ_PAGE_URL);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json(createResponse(false, null, {
    code: 'INTERNAL_ERROR',
    message: err.message || 'Something went wrong!'
  }));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

export default app;