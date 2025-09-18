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

// API response type for consistency
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Utility function to create API responses
const createResponse = <T>(success: boolean, data?: T, error?: { code: string; message: string }): ApiResponse<T> => ({
  success,
  data,
  error
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json(createResponse(true, { status: 'Server is running' }));
});

// Import route handlers
import fileRoutes from './routes/files';
import quizRoutes from './routes/quiz';

app.use('/api', fileRoutes);
app.use('/api', quizRoutes);

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