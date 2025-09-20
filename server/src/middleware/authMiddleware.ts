import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof payload === 'object' && payload.sub) {
      req.user = { id: payload.sub as string };
  next();
  return;
    } else {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
