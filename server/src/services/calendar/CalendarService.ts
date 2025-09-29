import { CalendarEvent } from '../../../../shared/CalendarEvent';

export interface CalendarProvider {
  fetchEvents(userId: string): Promise<CalendarEvent[]>;
}

export class CalendarService {
  constructor(private providers: CalendarProvider[]) {}

  async fetchAllEvents(userId: string): Promise<CalendarEvent[]> {
    const allEvents = await Promise.all(
      this.providers.map((provider) => provider.fetchEvents(userId))
    );
    return allEvents.flat();
  }
}
