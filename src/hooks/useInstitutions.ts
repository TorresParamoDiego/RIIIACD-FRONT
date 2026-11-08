import { fetchInstitutions } from '@/services/institutionsService';
import type { Institution } from '@/types/institution';
import { useAsyncResource, type AsyncResource } from './useAsyncResource';

export function useInstitutions(): AsyncResource<Institution[]> {
  return useAsyncResource(fetchInstitutions);
}
