import { Router } from 'express';
import { getCalendarEvents } from '../controllers/calendarController';

const router = Router();

router.get('/', getCalendarEvents);

export default router;
