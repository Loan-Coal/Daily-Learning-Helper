import cron from 'node-cron';
import prisma from '../prisma/client';
import { sendQuizReminderEmail } from './emailService';

// Helper to get current time in HH:mm (24h) format
function getCurrentTimeHHMM(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

export function startQuizReminderScheduler(quizPageUrl: string) {
  cron.schedule('* * * * *', async () => {
    const nowHHMM = getCurrentTimeHHMM();
    const users = await prisma.user.findMany({ where: { quizReminderTime: nowHHMM } });
    for (const user of users) {
      await sendQuizReminderEmail(user.email, quizPageUrl);
    }
  });
}
