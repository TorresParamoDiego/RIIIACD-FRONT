import { useMemo } from 'react';
import { fetchPublicMembers } from '@/services/membersService';
import type { PublicMember } from '@/types/member';
import { useAsyncResource, type AsyncStatus } from './useAsyncResource';

export interface UseMembersResult {
  status: AsyncStatus;
  members: PublicMember[];
  error: Error | undefined;
  retry: () => void;
  /** true si la lista incluye registros demostrativos. */
  includesDemoData: boolean;
  getById: (id: string | null | undefined) => PublicMember | undefined;
}

/** Directorio público de integrantes (datos locales hoy, API mañana). */
export function useMembers(): UseMembersResult {
  const { status, data, error, retry } = useAsyncResource(fetchPublicMembers);

  return useMemo<UseMembersResult>(() => {
    const members = data ?? [];
    const byId = new Map(members.map((m) => [m.id, m]));
    return {
      status,
      members,
      error,
      retry,
      includesDemoData: members.some((m) => m.esDemostrativo),
      getById: (id) => (id ? byId.get(id) : undefined),
    };
  }, [status, data, error, retry]);
}
