import type { PublicMember } from '@/types/member';

/** Nombre para mostrar, con tratamiento académico cuando está documentado. */
export function formatMemberName(member: Pick<PublicMember, 'tratamiento' | 'nombreCompleto'>): string {
  return member.tratamiento ? `${member.tratamiento} ${member.nombreCompleto}` : member.nombreCompleto;
}
