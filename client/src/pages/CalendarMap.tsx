import React from 'react';
import { useCalendarEvents } from '../hooks/useCalendar';
import { formatDate } from '../utils/formatters';

const CalendarMap: React.FC = () => {
  const { data, isLoading, isError, error } = useCalendarEvents();

  if (isLoading) return <div className="flex justify-center items-center h-40"><span className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full"></span></div>;
  if (isError) return <div className="text-red-500">Error: {String(error)}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Calendar Events</h1>
      {(!data || data.length === 0) ? (
        <div className="text-gray-500">No events found.</div>
      ) : (
        <ul className="space-y-4">
          {data.map((event: any) => (
            <li key={event.id} className="bg-white rounded shadow p-4">
              <div className="font-semibold">{event.title}</div>
              <div className="text-gray-500 text-sm">{formatDate(event.date)}</div>
              <div className="mt-2 text-gray-700">{event.description}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CalendarMap;
