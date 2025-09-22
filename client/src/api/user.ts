import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

export async function getMe(): Promise<{ id: string; email: string; quizReminderTime?: string }> {
  const res = await api.get('/auth/me');
  if (!res.data.success) throw new Error(res.data.error?.message || 'Failed to fetch user');
  return res.data.data;
}

export async function setReminderTime(time: string): Promise<{ success: boolean }> {
  const res = await api.patch('/user/reminder-time', { time });
  if (!res.data.success) throw new Error(res.data.error?.message || 'Failed to set reminder time');
  return res.data.data;
}
