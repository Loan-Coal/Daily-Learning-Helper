import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useCalendarEvents = () => {
  return useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const { data } = await axios.get('/calendar/events');
      return data;
    },
  });
};
