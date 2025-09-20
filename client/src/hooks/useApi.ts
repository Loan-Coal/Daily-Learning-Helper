import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import * as filesApi from '../api/files';
import * as quizApi from '../api/quiz';

// File hooks
export const useFiles = (params?: {
  sortBy?: string;
  order?: string;
  tag?: string;
}) => {
  return useQuery({
    queryKey: ['files', params],
    queryFn: () => filesApi.getFiles(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUploadFiles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ files, tags }: { files: FileList; tags: string[] }) =>
      filesApi.uploadFiles(files, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Files uploaded successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload files');
    },
  });
};

// Quiz hooks
export const useStartQuiz = () => {
  return useMutation({
    mutationFn: quizApi.startQuiz,
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start quiz');
    },
  });
};

export const useSubmitAnswer = () => {
  return useMutation({
    mutationFn: quizApi.submitAnswer,
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit answer');
    },
  });
};

export const useNextQuestion = () => {
  return useMutation({
    mutationFn: quizApi.nextQuestion,
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to navigate to next question');
    },
  });
};

export const usePreviousQuestion = () => {
  return useMutation({
    mutationFn: quizApi.previousQuestion,
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to navigate to previous question');
    },
  });
};

export const useQuizSession = (sessionId: string) => {
  return useQuery({
    queryKey: ['quiz-session', sessionId],
    queryFn: () => quizApi.getQuizSession(sessionId),
    enabled: !!sessionId,
  });
};