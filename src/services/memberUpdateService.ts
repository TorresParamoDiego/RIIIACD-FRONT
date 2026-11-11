import { DEFAULT_PHOTO_RULES } from '@/utils/memberUpdate';
import type {
  ChangeSubmissionResult,
  InvitationErrorCode,
  MemberChangeProposal,
  MemberInvitation,
  PhotoUploadResult,
} from '@/types/memberUpdate';
import { ApiError, apiGet, apiSend, isApiEnabled, simulateRequest } from './http';

/**
 * Servicio del flujo de actualización de perfil por enlace único.
 *
 * Sin API configurada (VITE_API_BASE_URL vacía) responde con datos de
 * demostración para poder revisar la interfaz:
 *   /actualizar/demo      → enlace válido
 *   /actualizar/expirado  → enlace caducado
 *   /actualizar/usado     → enlace ya utilizado
 *   cualquier otro token  → enlace inválido
 */

const enc = (token: string): string => encodeURIComponent(token);

export function getInvitation(token: string, signal?: AbortSignal): Promise<MemberInvitation> {
  if (isApiEnabled()) return apiGet<MemberInvitation>(`/invitations/${enc(token)}`, signal);
  return simulateInvitation(token, signal);
}

export function uploadPhoto(token: string, file: File, signal?: AbortSignal): Promise<PhotoUploadResult> {
  if (isApiEnabled()) {
    const form = new FormData();
    form.append('foto', file);
    return apiSend<PhotoUploadResult>('PUT', `/invitations/${enc(token)}/photo`, form, signal);
  }
  return simulateRequest({ fotoId: 'demo-foto', estado: 'pendiente' as const }, signal);
}

export function submitChanges(token: string, proposal: MemberChangeProposal, signal?: AbortSignal): Promise<ChangeSubmissionResult> {
  if (isApiEnabled()) return apiSend<ChangeSubmissionResult>('POST', `/invitations/${enc(token)}/changes`, proposal, signal);
  return simulateRequest({ solicitudesCreadas: Object.keys(proposal).filter((k) => k !== 'versionTextoConsentimiento').length }, signal);
}

/** Traduce un error de la API al motivo que se muestra al integrante. */
export function invitationErrorCode(error: unknown): InvitationErrorCode | null {
  if (!(error instanceof ApiError)) return null;
  if (error.code === 'invitacion-expirada' || error.code === 'invitacion-usada' || error.code === 'invitacion-invalida') {
    return error.code;
  }
  return error.status === 404 ? 'invitacion-invalida' : null;
}

/* ---------------------------- Modo demostración --------------------------- */

const DEMO_INVITATION: MemberInvitation = {
  integrante: {
    id: 'demo',
    nombreCompleto: 'Integrante de demostración',
    correoInstitucionalEnmascarado: 'i•••@celaya.tecnm.mx',
  },
  expiraEn: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
  perfil: {
    biografia: null,
    perfilProfesional: null,
    lineaInvestigacionId: 'linea-2',
    lineasPropuestas: [],
    correoPublicoAutorizado: false,
    fotoUrl: null,
  },
  textoConsentimiento: {
    version: 'borrador-0',
    // PENDIENTE (brief 4.8): el aviso de privacidad y este texto los redacta la institución.
    texto:
      'Autorizo a la RIIIACD a publicar mi correo institucional en mi ficha del directorio público. Puedo retirar esta autorización en cualquier momento.',
  },
  foto: DEFAULT_PHOTO_RULES,
};

async function simulateInvitation(token: string, signal?: AbortSignal): Promise<MemberInvitation> {
  await simulateRequest(null, signal);
  if (token === 'demo') return DEMO_INVITATION;
  const code: InvitationErrorCode =
    token === 'expirado' ? 'invitacion-expirada' : token === 'usado' ? 'invitacion-usada' : 'invitacion-invalida';
  throw new ApiError('Enlace no disponible (demostración).', code === 'invitacion-invalida' ? 404 : 410, code);
}
