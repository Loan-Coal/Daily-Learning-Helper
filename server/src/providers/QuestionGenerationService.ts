import { QuestionSet } from '../../../shared/QuestionSet';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import path from 'path';
import fs from 'fs';
import { LLMStrategy } from '../services/strategies/LLMStrategy';
import { MockStrategy } from '../services/strategies/MockStrategy';

export class QuestionGenerationService {
  private ajv: Ajv;
  private schema: any;
  private llmStrategy: LLMStrategy;
  private mockStrategy: MockStrategy;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    const schemaPath = path.join(__dirname, '../../../shared/question-set.1.0.json');
    this.schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    this.llmStrategy = new LLMStrategy();
    this.mockStrategy = new MockStrategy();
  }

  async generate(tags: string[], userId: string): Promise<QuestionSet> {
    try {
      const result = await this.llmStrategy.generate(tags, userId);
      if (this.validate(result)) {
        return result;
      } else {
        console.error('LLMStrategy output failed schema validation, falling back to MockStrategy');
      }
    } catch (err) {
      console.error('LLMStrategy error:', err);
    }
    // Fallback to mock
    const mockResult = await this.mockStrategy.generate(tags);
    if (!this.validate(mockResult)) {
      throw new Error('MockStrategy output failed schema validation');
    }
    return mockResult;
  }

  validate(data: any): boolean {
    const validate = this.ajv.compile(this.schema);
    return validate(data) as boolean;
  }
}
