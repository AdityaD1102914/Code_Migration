import { useCallback, useState } from 'react';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { APIInterceptor } from './axiosInterceptor';

// Define a simple stateful hook for API requests
export function useApi<T = any, R = AxiosResponse<T>>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);


  // apiCall: returns a function for making an API call
  const apiCall = useCallback(
    async (config: AxiosRequestConfig): Promise<R | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await APIInterceptor.request<T, R>(config);
        return response;
      } catch (err) {
        setError(err as Error);
        return err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { apiCall, loading, error };
}
