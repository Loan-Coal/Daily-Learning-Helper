import { QuestionSet } from '../../../../shared/QuestionSet';
import fs from 'fs';
import path from 'path';

export class MockStrategy {
  async generate(tags: string[]): Promise<QuestionSet> {
    let usedTags = tags;
    // If no tags, pick a random available mock tag
    if (!tags || tags.length === 0) {
      const dir = path.join(__dirname, '../../mocks/questions');
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      if (files.length > 0) {
        const randomFile = files[Math.floor(Math.random() * files.length)];
        usedTags = [randomFile.replace(/\.json$/, '')];
      } else {
        usedTags = [];
      }
    }
    let merged: QuestionSet = {
      schemaVersion: '1.0',
      tags: usedTags,
      source: 'mock',
      questions: [],
    };
    for (const tag of usedTags) {
      const filePath = path.join(__dirname, '../../mocks/questions', `${tag}.json`);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        merged.questions.push(...(data.questions || []));
      }
    }
    return merged;
  }
}
