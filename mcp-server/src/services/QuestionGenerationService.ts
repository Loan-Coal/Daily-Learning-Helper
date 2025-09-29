import axios from 'axios';

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  source: string;
}

export interface QuestionGenerationRequest {
  contexts: string[];
  tags: string[];
  questionCount: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
}

export class QuestionGenerationService {
  private mixtralApiKey: string;
  private mixtralApiUrl: string;
  private model: string;

  constructor() {
    this.mixtralApiKey = process.env.MIXTRAL_API_KEY || '';
    this.mixtralApiUrl = process.env.MIXTRAL_API_URL || '';
    this.model = process.env.MIXTRAL_MODEL || 'mistralai/Mixtral-8x7B-Instruct-v0.1';
  }

  async generateQuestions(request: QuestionGenerationRequest): Promise<GeneratedQuestion[]> {
    try {
      if (!this.mixtralApiKey) {
        throw new Error('Mixtral API key not configured');
      }

      const prompt = this.buildPrompt(request);
      
      console.log(`Generating ${request.questionCount} questions using Mixtral`);
      
      const response = await axios.post(
        `${this.mixtralApiUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000,
          temperature: 0.7,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${this.mixtralApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout
        }
      );

      const generatedText = response.data.choices[0].message.content;
      const questions = this.parseQuestions(generatedText, request.tags);
      
      console.log(`Successfully generated ${questions.length} questions`);
      return questions;
      
    } catch (error) {
      console.error('Failed to generate questions with Mixtral:', error);
      throw error;
    }
  }

  private buildPrompt(request: QuestionGenerationRequest): string {
    const { contexts, tags, questionCount, difficulty = 'mixed' } = request;

    return `You are an expert educational content creator. Based on the following educational content, generate ${questionCount} multiple-choice questions that test deep understanding and critical thinking.

CONTENT CONTEXTS:
${contexts.map((context, index) => `--- Context ${index + 1} ---\n${context}`).join('\n\n')}

REQUIREMENTS:
- Generate exactly ${questionCount} questions
- Topics/Tags: ${tags.join(', ')}
- Difficulty: ${difficulty}
- Each question must have exactly 4 multiple choice options (A, B, C, D)
- Questions should test understanding, analysis, and application - not just memorization
- Include clear explanations for why the correct answer is right
- Vary question types: conceptual, analytical, application-based
- Ensure questions are directly relevant to the provided content

OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "question": "Clear, specific question text?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this answer is correct and others are wrong",
      "difficulty": "medium",
      "source": "Brief reference to which part of content this comes from"
    }
  ]
}

Generate the questions now - respond ONLY with valid JSON:`;
  }

  private parseQuestions(generatedText: string, tags: string[]): GeneratedQuestion[] {
    try {
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid JSON structure - missing questions array');
      }

      return parsed.questions.map((q: any, index: number) => ({
        question: q.question || `Question ${index + 1}`,
        options: q.options || ['A', 'B', 'C', 'D'],
        correctAnswer: q.correctAnswer || 0,
        explanation: q.explanation || 'No explanation provided',
        difficulty: q.difficulty || 'medium',
        tags: tags,
        source: q.source || 'Generated content'
      }));
      
    } catch (error) {
      console.error('Failed to parse generated questions:', error);
      console.error('Raw response:', generatedText);
      throw new Error('Invalid question format received from LLM');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.mixtralApiKey) {
        return false;
      }

      const response = await axios.post(
        `${this.mixtralApiUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: 'Test connection. Respond with just "OK".' }],
          max_tokens: 10,
          temperature: 0
        },
        {
          headers: {
            'Authorization': `Bearer ${this.mixtralApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Mixtral connection test failed:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return !!(this.mixtralApiKey && this.mixtralApiUrl);
  }
}