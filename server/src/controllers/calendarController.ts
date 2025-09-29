import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { CalendarService } from '../services/calendar/CalendarService';
import { GoogleProvider } from '../providers/calendar/GoogleProvider';
import { OutlookProvider } from '../providers/calendar/OutlookProvider';
import { ICSProvider } from '../providers/calendar/ICSProvider';

const calendarService = new CalendarService([
  new GoogleProvider(),
  new OutlookProvider(),
  new ICSProvider(),
]);

export const getCalendarEvents = async (req: AuthRequest, res: Response) => {
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
    const events = await calendarService.fetchAllEvents(userId);
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};
