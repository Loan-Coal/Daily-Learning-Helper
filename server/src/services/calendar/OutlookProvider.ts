import { CalendarProvider } from './CalendarService';
import { CalendarEvent } from '../../interfaces/CalendarEvent';

export class OutlookProvider implements CalendarProvider {
  async fetchEvents(userId: string): Promise<CalendarEvent[]> {
    // Placeholder: Implement Outlook Calendar OAuth and fetch logic in production
    return [
      {
        id: 'outlook-1',
        userId,
        source: 'outlook',
        externalId: 'outlook-evt-1',
        title: 'Outlook Event',
        description: 'Sample Outlook event',
        start: new Date(),
        end: new Date(),
        rawJSON: '{}',
        createdAt: new Date(),
      },
    ];
  }
}
