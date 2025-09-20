import { QuestionSet } from '../../interfaces/QuestionSet';
import fs from 'fs';
import path from 'path';

export class MockStrategy {
  async generate(tags: string[]): Promise<QuestionSet> {
    let merged: QuestionSet = {
      schemaVersion: '1.0',
      tags,
      source: 'mock',
      questions: [],
    };
    for (const tag of tags) {
      const filePath = path.join(__dirname, '../../mocks/questions', `${tag}.json`);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        merged.questions.push(...(data.questions || []));
      }
    }
    return merged;
  }
}
