import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../utils/responseHandler';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(createErrorResponse('Authorization token required'));
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      res.status(500).json(createErrorResponse('Server configuration error'));
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = {
      userId: decoded.userId || decoded.id,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json(createErrorResponse('Invalid or expired token'));
  }
};