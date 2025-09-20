import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { TagRecommendationService } from '../services/TagRecommendationService';
import { AgentStrategy } from '../services/strategies/AgentStrategy';
import { RosterStrategy } from '../services/strategies/RosterStrategy';

// Feature flag/config for strategy selection
const useAgent = process.env.TAG_RECOMMENDATION_STRATEGY === 'agent';
const strategy = useAgent ? new AgentStrategy() : new RosterStrategy();
const tagRecommendationService = new TagRecommendationService(strategy);

export const getTagRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    let userId: string | undefined = undefined;
    if (typeof req.user?.id === 'string') {
      userId = req.user.id;
    } else if (typeof req.query.userId === 'string') {
      userId = req.query.userId;
    } else if (Array.isArray(req.query.userId) && typeof req.query.userId[0] === 'string') {
      userId = req.query.userId[0];
    }
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const recommendations = await tagRecommendationService.getRecommendations(userId);
    return res.json(recommendations);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch tag recommendations' });
  }
};
