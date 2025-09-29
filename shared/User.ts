/**
 * User model interface (matches Prisma schema)
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  quizReminderTime: string; // HH:mm
  createdAt: string;
  updatedAt: string;
}
