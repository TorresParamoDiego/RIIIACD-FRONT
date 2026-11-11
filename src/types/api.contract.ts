/**
 * Verificación de contrato entre los tipos escritos a mano y los generados
 * desde el OpenAPI del backend (`npm run api:types` → api.generated.ts).
 *
 * No genera código: si el backend cambia un campo y no se actualizan los
 * tipos del frontend (o al revés), `npm run typecheck` falla aquí.
 *
 * Se comparan los nombres de campo y sus tipos sin `null`/`undefined`: la API
 * envía `null` donde el frontend usa campos opcionales, y el código del sitio
 * ya trata ambos como "sin valor".
 */
import type { components } from './api.generated';
import type { Institution } from './institution';
import type { PublicMember } from './member';
import type { EditableProfile, MemberChangeProposal, MemberInvitation, PhotoRules } from './memberUpdate';
import type { ResearchLine } from './research';
import type { NetworkStatistics } from './statistics';

type Schemas = components['schemas'];

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;
/** Quita opcionalidad y null/undefined de cada campo (sin recorrer objetos anidados). */
type Strict<T> = { [K in keyof T]-?: Exclude<T[K], null | undefined> };
type Matches<A, B> = Same<Strict<A>, Strict<B>>;

export type ContractChecks = [
  Assert<Matches<PublicMember, Schemas['PublicMember']>>,
  Assert<Matches<Institution, Schemas['InstitutionOut']>>,
  Assert<Matches<ResearchLine, Schemas['ResearchLineOut']>>,
  Assert<Matches<NetworkStatistics, Schemas['StatisticsOut']>>,
  Assert<Matches<MemberChangeProposal, Schemas['MemberChangeProposal']>>,
  Assert<Matches<EditableProfile, Schemas['EditableProfile']>>,
  Assert<Matches<PhotoRules, Schemas['PhotoRules']>>,
  Assert<Same<keyof MemberInvitation, keyof Schemas['MemberInvitation']>>,
  Assert<Matches<MemberInvitation['integrante'], Schemas['InvitationMember']>>,
];

/** Respuesta paginada de GET /members. */
export type MemberPage = Schemas['MemberPage'];
