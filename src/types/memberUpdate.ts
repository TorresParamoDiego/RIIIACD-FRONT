/**
 * Contratos del flujo de actualización de perfil por enlace único
 * (brief fase 2, secciones 1.3 y 3.6).
 *
 *   GET  /invitations/{token}          → MemberInvitation   (valida sin consumir)
 *   PUT  /invitations/{token}/photo    → PhotoUploadResult  (foto a aprobación)
 *   POST /invitations/{token}/changes  → ChangeSubmissionResult (consume el enlace)
 *
 * La validez del enlace (24 horas, un solo uso) la decide el backend. El
 * frontend solo muestra el estado que recibe.
 *
 * Cuando se generen los tipos desde OpenAPI (`npm run api:types`), estas
 * interfaces deben coincidir con `src/types/api.generated.ts`.
 */
import type { ResearchLineId } from './research';

/** Motivos por los que un enlace no se puede usar. */
export type InvitationErrorCode = 'invitacion-invalida' | 'invitacion-expirada' | 'invitacion-usada';

/** Perfil editable tal como está publicado (valores ya aprobados). */
export interface EditableProfile {
  biografia: string | null;
  perfilProfesional: string | null;
  lineaInvestigacionId: ResearchLineId | null;
  lineasPropuestas: ResearchLineId[];
  /** true si ya existe una autorización aprobada para publicar el correo. */
  correoPublicoAutorizado: boolean;
  fotoUrl: string | null;
}

export interface ConsentText {
  version: string;
  texto: string;
}

export interface MemberInvitation {
  integrante: {
    id: string;
    nombreCompleto: string;
    /** Correo institucional enmascarado, p. ej. "j•••@celaya.tecnm.mx". */
    correoInstitucionalEnmascarado: string | null;
  };
  /** Fecha ISO 8601 de caducidad del enlace. */
  expiraEn: string;
  perfil: EditableProfile;
  textoConsentimiento: ConsentText;
  /** Restricciones de la fotografía, para validar antes de subir. */
  foto: PhotoRules;
}

export interface PhotoRules {
  formatos: string[];
  tamanoMaximoBytes: number;
}

/**
 * Cambios propuestos. Solo se envían los campos que cambiaron; cada uno se
 * convierte en una solicitud independiente en la cola de aprobación.
 */
export interface MemberChangeProposal {
  biografia?: string | null;
  perfilProfesional?: string | null;
  lineasPropuestas?: ResearchLineId[];
  solicitaCorreoPublico?: boolean;
  /** Obligatorio si `solicitaCorreoPublico` es true. */
  versionTextoConsentimiento?: string;
}

export interface ChangeSubmissionResult {
  solicitudesCreadas: number;
}

export interface PhotoUploadResult {
  fotoId: string;
  estado: 'pendiente';
}
