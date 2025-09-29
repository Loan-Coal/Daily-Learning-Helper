import { TagRecommendationStrategy, TagRecommendation } from '../../providers/TagRecommendationService';

export class RosterStrategy implements TagRecommendationStrategy {
  async recommendTags(userId: string): Promise<TagRecommendation[]> {
    // Placeholder: Implement deterministic rotation logic in production
    return [
      { tagId: 'mock-roster-tag-1', reason: 'RosterStrategy mock reason' },
    ];
  }
}
