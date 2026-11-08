/**
 * Origen de los datos del sitio.
 *
 * Fase 1: todos los datos provienen de `src/data`. Los registros marcados con
 * `esDemostrativo: true` existen solo para probar el directorio (paginación,
 * filtros) mientras se integra el padrón oficial del Excel.
 *
 * Variables de entorno (ver .env.example):
 *  - VITE_SHOW_DEMO_DATA: "false" oculta los registros demostrativos.
 *  - VITE_API_BASE_URL: URL base de la futura API. Si está vacía se usan datos locales.
 *  - VITE_MOCK_LATENCY_MS: retardo simulado de las solicitudes locales.
 */
export const dataSourceConfig = {
  showDemoData: import.meta.env.VITE_SHOW_DEMO_DATA !== 'false',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  mockLatencyMs: Number(import.meta.env.VITE_MOCK_LATENCY_MS ?? 350),
} as const;

export const MEMBERS_PAGE_SIZE = 12;
