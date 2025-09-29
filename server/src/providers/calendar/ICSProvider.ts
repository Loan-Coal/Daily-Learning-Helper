import { CalendarProvider } from '../../services/calendar/CalendarService';
import { CalendarEvent } from '../../../../shared/CalendarEvent';

export class ICSProvider implements CalendarProvider {
  async fetchEvents(userId: string): Promise<CalendarEvent[]> {
    // Placeholder: Implement ICS file parsing logic in production
    return [
      {
        id: 'ics-1',
        userId,
        source: 'ics',
        externalId: 'ics-evt-1',
        title: 'ICS Event',
        description: 'Sample ICS event',
        start: new Date(),
        end: new Date(),
        rawJSON: '{}',
        createdAt: new Date(),
      },
    ];
  }
}
