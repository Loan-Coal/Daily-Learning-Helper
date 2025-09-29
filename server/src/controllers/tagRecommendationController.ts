import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { TagRecommendationService } from '../providers/TagRecommendationService';

// Simple mock strategy for now since the strategy files don't exist
const mockStrategy = {
  getRecommendations: async (userId: string) => {
    // Return some default tags for now
    return ['work', 'study', 'personal', 'meeting', 'project'];
  }
};

const tagRecommendationService = new TagRecommendationService(mockStrategy as any);

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
