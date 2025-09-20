import { Router } from 'express';
import {
  getEventTagMappings,
  createEventTagMapping,
  updateEventTagMapping,
  deleteEventTagMapping,
} from '../controllers/eventTagMappingController';

const router = Router();

router.get('/', getEventTagMappings);
router.post('/', createEventTagMapping);
router.put('/:id', updateEventTagMapping);
router.delete('/:id', deleteEventTagMapping);

export default router;
