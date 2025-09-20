import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useTags = (search: string = '') => {
  return useQuery({
    queryKey: ['tags', search],
    queryFn: async () => {
      const { data } = await axios.get(`/tags?search=${search}`);
      return data;
    },
    enabled: search.length > 0,
  });
};
