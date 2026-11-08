import { dataSourceConfig } from '@/config/dataSource';

/**
 * Capa mínima de acceso a datos. En la fase 1 todos los servicios resuelven
 * con datos locales; cuando exista la API basta con definir
 * VITE_API_BASE_URL y usar `apiGet` dentro de cada servicio.
 */

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isApiEnabled(): boolean {
  return dataSourceConfig.apiBaseUrl.trim() !== '';
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${dataSourceConfig.apiBaseUrl}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    throw new ApiError(`La solicitud a ${path} respondió con estado ${response.status}.`, response.status);
  }
  return (await response.json()) as T;
}

/** Simula la latencia de red para que los estados de carga sean visibles con datos locales. */
export function simulateRequest<T>(data: T, signal?: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => resolve(data), dataSourceConfig.mockLatencyMs);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new DOMException('Solicitud cancelada', 'AbortError'));
    });
  });
}
