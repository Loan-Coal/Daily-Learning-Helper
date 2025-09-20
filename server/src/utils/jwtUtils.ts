import jwt from 'jsonwebtoken';

export function getJwtSecret(): string {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
  return process.env.JWT_SECRET;
}

export function verifyJwt(token: string): any {
  return jwt.verify(token, getJwtSecret());
}
