import { QuestionSet } from '../../interfaces/QuestionSet';
import { runPythonQuestionGen } from '../pythonService';

export class LLMStrategy {
  async generate(tags: string[], userId: string): Promise<QuestionSet> {
    // For now, call Python and parse output
    const schemaVersion = '1.0';
    const output = await runPythonQuestionGen(tags, userId, schemaVersion);
    return JSON.parse(output);
  }
}
