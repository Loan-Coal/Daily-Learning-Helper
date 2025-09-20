import { Request, Response } from 'express';
import { registerUser, authenticateUser, getUserById } from '../services/userService';
import { createResponse } from '../utils/createResponse';
import { verifyJwt } from '../utils/jwtUtils';

export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json(createResponse(false, null, { code: 'MISSING_FIELDS', message: 'Email and password are required' }));
    }
    // quizReminderTime is optional; default to empty string
    const user = await registerUser(email, password, '');
    return res.json(createResponse(true, { id: user.id, email: user.email, quizReminderTime: user.quizReminderTime }));
  } catch (error: any) {
    return res.status(400).json(createResponse(false, null, { code: 'REGISTER_ERROR', message: error.message }));
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json(createResponse(false, null, { code: 'MISSING_FIELDS', message: 'Email and password are required' }));
    }
    const token = await authenticateUser(email, password);
    console.log("Login successful, token generated:", token);
    return res.json(createResponse(true, { token }));
  } catch (error: any) {
    return res.status(401).json(createResponse(false, null, { code: 'LOGIN_ERROR', message: error.message }));
  }
}

export async function me(req: Request, res: Response) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json(createResponse(false, null, { code: 'NO_TOKEN', message: 'No token provided' }));
    }
    const token = auth.replace('Bearer ', '');
    const payload = verifyJwt(token);
    const user = await getUserById(payload.userId);
    if (!user) {
      return res.status(404).json(createResponse(false, null, { code: 'USER_NOT_FOUND', message: 'User not found' }));
    }
    return res.json(createResponse(true, { id: user.id, email: user.email, quizReminderTime: user.quizReminderTime }));
  } catch (error: any) {
    return res.status(401).json(createResponse(false, null, { code: 'AUTH_ERROR', message: error.message }));
  }
}
