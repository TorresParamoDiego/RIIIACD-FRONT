import { useCallback, useEffect, useState } from 'react';

export type AsyncStatus = 'loading' | 'success' | 'error';

export interface AsyncResource<T> {
  status: AsyncStatus;
  data: T | undefined;
  error: Error | undefined;
  retry: () => void;
}

type Loader<T> = (signal: AbortSignal) => Promise<T>;

interface Settled<T> {
  /** Solicitud a la que corresponde este resultado (cargador + intento). */
  loader: Loader<T>;
  attempt: number;
  status: Exclude<AsyncStatus, 'loading'>;
  data: T | undefined;
  error: Error | undefined;
}

/**
 * Ejecuta un cargador asíncrono con cancelación y reintento.
 * `loader` debe ser estable (función de módulo o memorizada).
 *
 * El estado "cargando" se deriva: hay carga mientras el último resultado no
 * corresponde al cargador e intento actuales. Así el efecto solo actualiza el
 * estado cuando la promesa termina.
 */
export function useAsyncResource<T>(loader: Loader<T>): AsyncResource<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setSettled({ loader, attempt, status: 'success', data, error: undefined });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setSettled({
          loader,
          attempt,
          status: 'error',
          data: undefined,
          error: error instanceof Error ? error : new Error('No se pudo cargar la información.'),
        });
      });

    return () => controller.abort();
  }, [loader, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const current = settled && settled.loader === loader && settled.attempt === attempt ? settled : null;
  if (!current) return { status: 'loading', data: undefined, error: undefined, retry };
  return { status: current.status, data: current.data, error: current.error, retry };
}
