import { publicMembers } from '@/data/members';
import type { MemberPage } from '@/types/api.contract';
import type { PublicMember } from '@/types/member';
import { apiGet, isApiEnabled, simulateRequest } from './http';

/** Máximo que acepta el backend por página (MEMBERS_MAX_PAGE_SIZE). */
const API_PAGE_SIZE = 100;

/**
 * Servicio del directorio público.
 *
 * Contrato de la API: GET /members → { items, total, pagina, porPagina, totalPaginas }
 * (el backend es responsable de no enviar campos administrativos).
 *
 * Transición: la página de integrantes todavía filtra y pagina en el
 * navegador, así que aquí se piden todas las páginas y se concatenan
 * (la red tiene alrededor de 90 integrantes: una o dos solicitudes).
 * PENDIENTE: pasar los filtros de la URL a la API (`q`, `institucion`,
 * `linea`, `rol`, `orden`, `pagina`) para usar la paginación del servidor.
 */
export async function fetchPublicMembers(signal?: AbortSignal): Promise<PublicMember[]> {
  if (!isApiEnabled()) return simulateRequest(publicMembers, signal);

  const fetchPage = (pagina: number): Promise<MemberPage> =>
    apiGet<MemberPage>(`/members?porPagina=${API_PAGE_SIZE}&pagina=${pagina}`, signal);

  const first = await fetchPage(1);
  const all = [...first.items] as PublicMember[];
  for (let pagina = 2; pagina <= Math.min(first.totalPaginas, 50); pagina += 1) {
    all.push(...((await fetchPage(pagina)).items as PublicMember[]));
  }
  return all;
}
