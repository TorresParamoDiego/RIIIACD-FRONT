import { dataSourceConfig } from '@/config/dataSource';

/**
 * Capa mínima de acceso a datos. En la fase 1 todos los servicios resuelven
 * con datos locales; cuando exista la API basta con definir
 * VITE_API_BASE_URL y usar `apiGet` dentro de cada servicio.
 */

export class ApiError extends Error {
  readonly status: number;
  /** Código de error de negocio enviado por el backend (`detail.codigo`), si lo hay. */
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/** Formato de error del backend: `{ "detail": { "codigo": "...", "mensaje": "..." } }`. */
async function toApiError(response: Response, path: string): Promise<ApiError> {
  let code: string | undefined;
  let message = `La solicitud a ${path} respondió con estado ${response.status}.`;
  try {
    const body = (await response.json()) as { detail?: { codigo?: string; mensaje?: string } | string };
    if (body.detail && typeof body.detail === 'object') {
      code = body.detail.codigo;
      if (body.detail.mensaje) message = body.detail.mensaje;
    }
  } catch {
    /* respuesta sin JSON */
  }
  return new ApiError(message, response.status, code);
}

export function isApiEnabled(): boolean {
  return dataSourceConfig.apiBaseUrl.trim() !== '';
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${dataSourceConfig.apiBaseUrl}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) throw await toApiError(response, path);
  return (await response.json()) as T;
}

/**
 * POST/PUT/PATCH. Acepta JSON o `FormData` (para archivos). No envía cookies:
 * el sitio público no usa sesión; los endpoints de integrante se autorizan con
 * el token del enlace.
 */
export async function apiSend<T>(method: 'POST' | 'PUT' | 'PATCH', path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const isForm = body instanceof FormData;
  const response = await fetch(`${dataSourceConfig.apiBaseUrl}${path}`, {
    method,
    headers: isForm ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: isForm ? body : JSON.stringify(body),
    credentials: 'omit',
    signal,
  });
  if (!response.ok) throw await toApiError(response, path);
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
