import React from 'react';

interface CalendarEventMapperProps {
  event: { id: string; title: string; date: string; description: string };
}

const CalendarEventMapper: React.FC<CalendarEventMapperProps> = ({ event }) => (
  <div className="bg-white rounded shadow p-4 mb-4">
    <div className="font-bold text-lg">{event.title}</div>
    <div className="text-gray-500 text-sm">{event.date}</div>
    <div className="mt-2 text-gray-700">{event.description}</div>
  </div>
);

export default CalendarEventMapper;
