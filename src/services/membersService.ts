import { publicMembers } from '@/data/members';
import type { PublicMember } from '@/types/member';
import { apiGet, isApiEnabled, simulateRequest } from './http';

/**
 * Servicio del directorio público.
 * Contrato esperado de la futura API: GET /members → PublicMember[]
 * (el backend es responsable de no enviar campos administrativos).
 */
export function fetchPublicMembers(signal?: AbortSignal): Promise<PublicMember[]> {
  if (isApiEnabled()) return apiGet<PublicMember[]>('/members', signal);
  return simulateRequest(publicMembers, signal);
}
