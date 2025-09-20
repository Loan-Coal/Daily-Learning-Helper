import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

export async function sendQuizReminderEmail(to: string, quizLink: string) {
  const subject = 'Your Daily Quiz Reminder!';
  const html = `<p>Hi! This is your daily reminder to take your quiz. <a href="${quizLink}">Start Quiz</a></p>`;
  await sendEmail(to, subject, html);
}
