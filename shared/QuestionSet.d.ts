import { Question } from './Question';
/**
 * QuestionSet interface for quiz generation
 */
export interface QuestionSet {
    schemaVersion: '1.0';
    tags: string[];
    source: 'mock' | 'llm';
    metadata?: {
        [k: string]: unknown;
    };
    questions: Question[];
}
//# sourceMappingURL=QuestionSet.d.ts.map