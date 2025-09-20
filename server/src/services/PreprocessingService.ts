import { File } from '@prisma/client';

export class PreprocessingService {
  static summarize(documentText: string): string {
    // Simple rule-based summarizer: extract headings, bullets, and key sentences
    const lines = documentText.split(/\r?\n/);
    const summaryLines = lines.filter(line =>
      /^\s*[-*•]/.test(line) || /^#+\s/.test(line) || line.length > 80
    );
    return JSON.stringify({ summary: summaryLines });
  }
}
