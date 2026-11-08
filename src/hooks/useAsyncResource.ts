import { useCallback, useEffect, useState } from 'react';

export type AsyncStatus = 'loading' | 'success' | 'error';

export interface AsyncResource<T> {
  status: AsyncStatus;
  data: T | undefined;
  error: Error | undefined;
  retry: () => void;
}

type Loader<T> = (signal: AbortSignal) => Promise<T>;

/**
 * Ejecuta un cargador asíncrono con cancelación y reintento.
 * `loader` debe ser estable (función de módulo o memorizada).
 */
export function useAsyncResource<T>(loader: Loader<T>): AsyncResource<T> {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<Omit<AsyncResource<T>, 'retry'>>({
    status: 'loading',
    data: undefined,
    error: undefined,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, status: 'loading', error: undefined }));

    loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data, error: undefined });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          data: undefined,
          error: error instanceof Error ? error : new Error('No se pudo cargar la información.'),
        });
      });

    return () => controller.abort();
  }, [loader, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}
