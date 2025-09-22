import ical from 'ical.js';
import { EventInput } from '@fullcalendar/core';

export function parseIcsToEvents(icsText: string): EventInput[] {
  const jcalData = ical.parse(icsText);
  const comp = new ical.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');
  return vevents.map((vevent) => {
    const event = new ical.Event(vevent);
    return {
      id: event.uid,
      title: event.summary,
      start: event.startDate.toString(),
      end: event.endDate ? event.endDate.toString() : undefined,
      extendedProps: {
        description: event.description,
        source: 'ics',
      },
    };
  });
}
