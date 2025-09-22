import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import CalendarGrid from '../components/CalendarGrid';
import { parseIcsToEvents } from '../utils/ics';
import { getMe, setReminderTime } from '../api/user';

const ICS_URL = '/mock-calendar.ics';

const CalendarMap: React.FC = () => {
  const [icsEvents, setIcsEvents] = useState<any[]>([]);
  const [icsLoading, setIcsLoading] = useState(true);
  const [icsError, setIcsError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Reminder time state
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery(['me'], getMe);

  const [reminderTime, setReminderTimeState] = useState('');
  const [reminderTouched, setReminderTouched] = useState(false);

  useEffect(() => {
    setIcsLoading(true);
    fetch(ICS_URL)
      .then((res) => res.text())
      .then((ics) => setIcsEvents(parseIcsToEvents(ics)))
      .catch(() => setIcsError('Failed to load calendar events.'))
      .finally(() => setIcsLoading(false));
  }, []);

  useEffect(() => {
    if (user && user.quizReminderTime) {
      setReminderTimeState(user.quizReminderTime);
    }
  }, [user]);

  const mutation = useMutation(
    (time: string) => setReminderTime(time),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['me']);
        setReminderTouched(false);
      },
    }
  );

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReminderTimeState(e.target.value);
    setReminderTouched(true);
  };

  const handleTimeBlur = () => {
    if (reminderTouched && reminderTime) {
      mutation.mutate(reminderTime);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Calendar</h1>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <label className="font-medium flex items-center gap-2">
          Daily Reminder Time:
          <input
            type="time"
            className="border rounded px-2 py-1 ml-2"
            value={reminderTime}
            onChange={handleTimeChange}
            onBlur={handleTimeBlur}
            disabled={mutation.isLoading || userLoading}
          />
        </label>
        <span className="text-sm text-gray-500">
          Choose when to receive your daily quiz reminder.
        </span>
        {mutation.isSuccess && (
          <span className="text-green-600 text-sm">Saved!</span>
        )}
        {mutation.isError && (
          <span className="text-red-600 text-sm">Failed to save reminder.</span>
        )}
  </div>
      {userLoading && <div className="text-gray-500 mb-4">Loading user info...</div>}
      {icsLoading && <div className="text-gray-500">Loading calendar...</div>}
      {icsError && <div className="text-red-600">{icsError}</div>}
      {!icsLoading && !icsError && (
        <CalendarGrid events={icsEvents} />
      )}
    </div>
  );
};

export default CalendarMap;
