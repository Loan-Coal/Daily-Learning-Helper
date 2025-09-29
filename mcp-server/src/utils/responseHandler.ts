export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}

export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString()
});

export const createErrorResponse = (
  message: string, 
  code?: string, 
  details?: any
): ApiResponse => ({
  success: false,
  error: {
    message,
    code,
    details
  },
  timestamp: new Date().toISOString()
});

export const handleAsyncRoute = (
  fn: (req: any, res: any, next: any) => Promise<void>
) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};