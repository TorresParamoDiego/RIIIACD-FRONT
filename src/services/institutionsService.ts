import { institutions } from '@/data/institutions';
import type { Institution } from '@/types/institution';
import { apiGet, isApiEnabled, simulateRequest } from './http';

/** Contrato esperado de la futura API: GET /institutions → Institution[] */
export function fetchInstitutions(signal?: AbortSignal): Promise<Institution[]> {
  if (isApiEnabled()) return apiGet<Institution[]>('/institutions', signal);
  return simulateRequest(institutions, signal);
}
