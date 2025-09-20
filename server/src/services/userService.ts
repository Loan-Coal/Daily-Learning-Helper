import prisma from '../prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { getJwtSecret } from '../utils/jwtUtils';

export async function registerUser(email: string, password: string, quizReminderTime?: string): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, quizReminderTime: quizReminderTime ?? '' },
  });
  return user;
}

export async function authenticateUser(email: string, password: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');
  const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });
  console.log('Token generated:', token);
  return token;
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}
