/**
 * CalendarEvent interface for user calendar events
 */
export interface CalendarEvent {
    id: string;
    userId: string;
    source: 'google' | 'outlook' | 'ics';
    externalId?: string;
    title: string;
    description?: string;
    start: Date;
    end: Date;
    rawJSON?: string;
    createdAt: Date;
}
//# sourceMappingURL=CalendarEvent.d.ts.map