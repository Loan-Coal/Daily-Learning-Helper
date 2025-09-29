import { PrismaClient } from '@prisma/client';
import { GeneratedQuestion } from '../services/QuestionGenerationService';

export interface QuestionHistory {
  sessionId: string;
  questions: GeneratedQuestion[];
  tags: string[];
  createdAt: Date;
  sourceChunks: string[];
}

export class QuestionHistoryProvider {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async saveQuestionSet(
    sessionId: string,
    questions: GeneratedQuestion[],
    tags: string[],
    sourceChunks: string[]
  ): Promise<void> {
    try {
      await this.prisma.generatedQuestionSet.create({
        data: {
          sessionId,
          questions: JSON.stringify(questions),
          sourceChunks: JSON.stringify(sourceChunks),
          tags: JSON.stringify(tags),
          questionCount: questions.length,
          status: 'ready'
        }
      });

      console.log(`Saved question set for session ${sessionId} with ${questions.length} questions`);
    } catch (error) {
      console.error('Failed to save question set:', error);
      throw error;
    }
  }

  async getQuestionSet(sessionId: string): Promise<QuestionHistory | null> {
    try {
      const questionSet = await this.prisma.generatedQuestionSet.findUnique({
        where: { sessionId }
      });

      if (!questionSet) {
        return null;
      }

      return {
        sessionId: questionSet.sessionId,
        questions: JSON.parse(questionSet.questions),
        tags: JSON.parse(questionSet.tags),
        createdAt: questionSet.createdAt,
        sourceChunks: JSON.parse(questionSet.sourceChunks)
      };

    } catch (error) {
      console.error('Failed to get question set:', error);
      throw error;
    }
  }

  async updateQuestionSetStatus(
    sessionId: string,
    status: 'generating' | 'ready' | 'failed'
  ): Promise<void> {
    try {
      await this.prisma.generatedQuestionSet.update({
        where: { sessionId },
        data: { 
          status,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to update question set status:', error);
      throw error;
    }
  }

  async getRecentQuestionsByTags(
    tags: string[],
    limit: number = 10
  ): Promise<GeneratedQuestion[]> {
    try {
      const questionSets = await this.prisma.generatedQuestionSet.findMany({
        where: {
          status: 'ready',
          tags: {
            contains: tags[0] // Simple containment check for now
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      // Extract all questions from the sets
      const allQuestions: GeneratedQuestion[] = [];
      for (const set of questionSets) {
        const questions = JSON.parse(set.questions) as GeneratedQuestion[];
        allQuestions.push(...questions);
      }

      return allQuestions;

    } catch (error) {
      console.error('Failed to get recent questions by tags:', error);
      throw error;
    }
  }

  async avoidDuplicateQuestions(
    newQuestions: GeneratedQuestion[],
    tags: string[],
    similarityThreshold: number = 0.8
  ): Promise<GeneratedQuestion[]> {
    try {
      // Get recent questions for these tags
      const recentQuestions = await this.getRecentQuestionsByTags(tags, 50);
      
      // Simple duplicate detection based on question text similarity
      const uniqueQuestions: GeneratedQuestion[] = [];
      
      for (const newQuestion of newQuestions) {
        let isDuplicate = false;
        
        for (const recentQuestion of recentQuestions) {
          // Simple similarity check - in production, use proper string similarity
          const similarity = this.calculateStringSimilarity(
            newQuestion.question.toLowerCase(),
            recentQuestion.question.toLowerCase()
          );
          
          if (similarity > similarityThreshold) {
            console.log(`Skipping duplicate question: ${newQuestion.question}`);
            isDuplicate = true;
            break;
          }
        }
        
        if (!isDuplicate) {
          uniqueQuestions.push(newQuestion);
        }
      }
      
      console.log(`Filtered ${newQuestions.length - uniqueQuestions.length} duplicate questions`);
      return uniqueQuestions;

    } catch (error) {
      console.error('Failed to filter duplicate questions:', error);
      // Return all questions if filtering fails
      return newQuestions;
    }
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity based on words
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  async getQuestionSetStats(): Promise<{
    totalSets: number;
    readySets: number;
    generatingSets: number;
    failedSets: number;
    totalQuestions: number;
  }> {
    try {
      const totalSets = await this.prisma.generatedQuestionSet.count();
      const readySets = await this.prisma.generatedQuestionSet.count({
        where: { status: 'ready' }
      });
      const generatingSets = await this.prisma.generatedQuestionSet.count({
        where: { status: 'generating' }
      });
      const failedSets = await this.prisma.generatedQuestionSet.count({
        where: { status: 'failed' }
      });

      const allSets = await this.prisma.generatedQuestionSet.findMany({
        where: { status: 'ready' },
        select: { questionCount: true }
      });

      const totalQuestions = allSets.reduce((sum: number, set: any) => sum + set.questionCount, 0);

      return {
        totalSets,
        readySets,
        generatingSets,
        failedSets,
        totalQuestions
      };

    } catch (error) {
      console.error('Failed to get question set stats:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}