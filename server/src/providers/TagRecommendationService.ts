import { Tag } from '../../../shared/Tag';
import { AgentStrategy } from './strategies/AgentStrategy';
import { RosterStrategy } from './strategies/RosterStrategy';

export type RecommendationReason = string;

export interface TagRecommendation {
  tagId: string;
  reason?: RecommendationReason;
}

export interface TagRecommendationStrategy {
  recommendTags(userId: string): Promise<TagRecommendation[]>;
}

export class TagRecommendationService {
  private strategy: TagRecommendationStrategy;

  constructor(strategy: TagRecommendationStrategy) {
    this.strategy = strategy;
  }

  async getRecommendations(userId: string): Promise<TagRecommendation[]> {
    return this.strategy.recommendTags(userId);
  }
}
