import { Router } from 'express';
import { getTagRecommendations } from '../controllers/tagRecommendationController';

const router = Router();

router.get('/recommendations', getTagRecommendations);

export default router;
