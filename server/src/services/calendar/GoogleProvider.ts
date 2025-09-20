import { CalendarProvider } from './CalendarService';
import { CalendarEvent } from '../../interfaces/CalendarEvent';

export class GoogleProvider implements CalendarProvider {
  async fetchEvents(userId: string): Promise<CalendarEvent[]> {
    // Placeholder: Implement Google Calendar OAuth and fetch logic in production
    return [
      {
        id: 'google-1',
        userId,
        source: 'google',
        externalId: 'gcal-evt-1',
        title: 'Google Event',
        description: 'Sample Google event',
        start: new Date(),
        end: new Date(),
        rawJSON: '{}',
        createdAt: new Date(),
      },
    ];
  }
}
