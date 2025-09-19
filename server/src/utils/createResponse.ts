export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export function createResponse<T>(
  success: boolean,
  data?: T,
  error?: { code: string; message: string }
): ApiResponse<T> {
  return { success, data, error };
}
