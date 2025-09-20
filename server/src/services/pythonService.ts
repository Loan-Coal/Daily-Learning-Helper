import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { Question } from '../interfaces/Question';

const execFileAsync = promisify(execFile);

export async function getQuestions(tags: string[], questionCount: number): Promise<Question[]> {
  const scriptPath = path.resolve(__dirname, '../../../python/generate_questions.py'); 
  const args = [
    '--tags', JSON.stringify(tags),
    '--questionCount', String(questionCount)
  ];
  try {
    const { stdout } = await execFileAsync('python', [scriptPath, ...args], { timeout: 10000 });
    const questions: Question[] = JSON.parse(stdout);
    if (!Array.isArray(questions)) throw new Error('Invalid questions format');
    return questions;
  } catch (err: any) {
    const message = err.stderr || err.message || 'Failed to generate questions with Python';
    const error: any = new Error(message);
    error.code = 'PYTHON_GENERATION_ERROR';
    throw error;
  }
}

export const runPythonQuestionGen = (tags: string[], userId: string, schemaVersion: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '../../../python/generate_questions.py');
    const args = [JSON.stringify(tags), userId, schemaVersion];
    execFile('python', [scriptPath, ...args], (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve(stdout);
      }
    });
  });
};
