/**
 * EventTagMapping interface for calendar event tagging
 */
export interface EventTagMapping {
  id: string;
  userId: string;
  patternType: 'exact' | 'contains' | 'regex';
  pattern: string;
  tagId: string;
  priority: number;
  createdAt: Date;
}
