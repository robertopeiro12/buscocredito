import { useState, useCallback } from 'react';

interface RetryConfig {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
}

interface RetryState {
  isLoading: boolean;
  error: Error | null;
  attempt: number;
}

export function useRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
) {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 5000,
  } = config;

  const [state, setState] = useState<RetryState>({
    isLoading: false,
    error: null,
    attempt: 0,
  });

  const calculateDelay = (attempt: number) => {
    const delay = Math.min(
      baseDelay * Math.pow(2, attempt),
      maxDelay
    );
    return delay + Math.random() * 1000; // Add jitter
  };

  const execute = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    let currentAttempt = 0;

    while (currentAttempt < maxAttempts) {
      try {
        const result = await operation();
        setState({
          isLoading: false,
          error: null,
          attempt: 0,
        });
        return result;
      } catch (error) {
        currentAttempt++;
        
        if (currentAttempt === maxAttempts) {
          setState({
            isLoading: false,
            error: error as Error,
            attempt: currentAttempt,
          });
          throw error;
        }

        setState(prev => ({
          ...prev,
          attempt: currentAttempt,
        }));

        await new Promise(resolve => 
          setTimeout(resolve, calculateDelay(currentAttempt))
        );
      }
    }
  }, [operation, maxAttempts, baseDelay, maxDelay]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      attempt: 0,
    });
  }, []);

  return {
    execute,
    reset,
    isLoading: state.isLoading,
    error: state.error,
    attempt: state.attempt,
  };
} 