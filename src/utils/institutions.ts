import type { Institution, InstitutionWithCount } from '@/types/institution';
import type { PublicMember } from '@/types/member';

/** Añade a cada institución el número de integrantes del directorio adscritos a ella. */
export function withMemberCounts(
  institutions: Institution[],
  members: PublicMember[],
): InstitutionWithCount[] {
  const counts = new Map<string, number>();
  for (const member of members) {
    if (!member.institucionId) continue;
    counts.set(member.institucionId, (counts.get(member.institucionId) ?? 0) + 1);
  }
  return institutions.map((inst) => ({ ...inst, integrantes: counts.get(inst.id) ?? 0 }));
}

const collator = new Intl.Collator('es-MX', { sensitivity: 'base', numeric: true });

/** Primero instituciones confirmadas, luego demostrativas; cada grupo en orden alfabético. */
export function sortInstitutions<T extends Institution>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => Number(a.esDemostrativo) - Number(b.esDemostrativo) || collator.compare(a.nombre, b.nombre),
  );
}
