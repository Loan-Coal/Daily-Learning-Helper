
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useQuizRecommendations = () => {
  return useQuery({
    queryKey: ['quiz-recommendations'],
    queryFn: async () => {
      const { data } = await axios.get('/tags/recommendations');
      return data;
    },
  });
};

export const useStartQuiz = () => {
  return useMutation({
    mutationFn: async (tags: string[]) => {
      const { data } = await axios.post('/quiz/start', { tags });
      return data;
    },
  });
};
