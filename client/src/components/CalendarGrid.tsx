import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';

export interface CalendarGridProps {
  events: EventInput[];
  initialView?: 'timeGridWeek' | 'dayGridMonth';
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  initialView = 'timeGridWeek',
}) => (
  <div className="w-full bg-white rounded shadow overflow-x-auto p-2">
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView={initialView}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek,dayGridMonth',
      }}
      height="auto"
      events={events}
      nowIndicator
      selectable={false}
      eventDisplay="block"
      aspectRatio={1.5}
    />
  </div>
);

export default CalendarGrid;
