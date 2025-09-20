import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prisma/client';

export const getEventTagMappings = async (req: AuthRequest, res: Response) => {
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
    const mappings = await prisma.eventTagMapping.findMany({ where: { userId } });
    return res.json(mappings);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch event tag mappings' });
  }
};

export const createEventTagMapping = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { patternType, pattern, tagId, priority } = req.body;
  const mapping = await prisma.eventTagMapping.create({
    data: { userId, patternType, pattern, tagId, priority },
  });
  return res.status(201).json(mapping);
};

export const updateEventTagMapping = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { patternType, pattern, tagId, priority } = req.body;
  const mapping = await prisma.eventTagMapping.update({
    where: { id },
    data: { patternType, pattern, tagId, priority },
  });
  return res.json(mapping);
};

export const deleteEventTagMapping = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  await prisma.eventTagMapping.delete({ where: { id } });
  return res.status(204).end();
};
