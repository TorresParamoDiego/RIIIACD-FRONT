/**
 * Lógica pura del formulario de actualización de perfil: validación y cálculo
 * de diferencias. Sin React, para poder probarla de forma aislada.
 *
 * La validación del cliente es solo una ayuda: el backend repite todas las
 * comprobaciones (longitudes, tipo real de imagen, tamaño).
 */
import { BIOGRAFIA_MAX_LENGTH, PERFIL_PROFESIONAL_MAX_LENGTH } from '@/types/member';
import type { EditableProfile, MemberChangeProposal, PhotoRules } from '@/types/memberUpdate';
import type { ResearchLineId } from '@/types/research';

export interface ProfileFormValues {
  biografia: string;
  perfilProfesional: string;
  lineasPropuestas: ResearchLineId[];
  solicitaCorreoPublico: boolean;
}

export type ProfileFormErrors = Partial<Record<keyof ProfileFormValues | 'foto', string>>;

/**
 * Reglas de fotografía por defecto (brief 3.4). Las reales llegan del backend
 * en `MemberInvitation.foto`.
 * PENDIENTE (brief 4.9): confirmar el tamaño máximo de 2 MB.
 */
export const DEFAULT_PHOTO_RULES: PhotoRules = {
  formatos: ['image/jpeg', 'image/png', 'image/webp'],
  tamanoMaximoBytes: 2 * 1024 * 1024,
};

export function initialValues(profile: EditableProfile): ProfileFormValues {
  return {
    biografia: profile.biografia ?? '',
    perfilProfesional: profile.perfilProfesional ?? '',
    lineasPropuestas: [...profile.lineasPropuestas],
    solicitaCorreoPublico: profile.correoPublicoAutorizado,
  };
}

export function validateProfile(values: ProfileFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  if (values.biografia.length > BIOGRAFIA_MAX_LENGTH) {
    errors.biografia = `La biografía no puede superar ${BIOGRAFIA_MAX_LENGTH.toLocaleString('es-MX')} caracteres.`;
  }
  if (values.perfilProfesional.length > PERFIL_PROFESIONAL_MAX_LENGTH) {
    errors.perfilProfesional = `El perfil profesional no puede superar ${PERFIL_PROFESIONAL_MAX_LENGTH} caracteres.`;
  }
  return errors;
}

export function validatePhoto(file: File | null, rules: PhotoRules = DEFAULT_PHOTO_RULES): string | undefined {
  if (!file) return undefined;
  if (!rules.formatos.includes(file.type)) return 'La fotografía debe ser JPEG, PNG o WEBP.';
  if (file.size > rules.tamanoMaximoBytes) {
    const mb = (rules.tamanoMaximoBytes / (1024 * 1024)).toLocaleString('es-MX', { maximumFractionDigits: 1 });
    return `La fotografía no puede pesar más de ${mb} MB.`;
  }
  return undefined;
}

const normalize = (text: string): string | null => {
  const trimmed = text.trim();
  return trimmed === '' ? null : trimmed;
};

const sameLines = (a: ResearchLineId[], b: ResearchLineId[]): boolean =>
  a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');

/** Calcula solo los campos que cambiaron respecto del perfil publicado. */
export function diffProposal(profile: EditableProfile, values: ProfileFormValues, consentVersion: string): MemberChangeProposal {
  const proposal: MemberChangeProposal = {};

  const biografia = normalize(values.biografia);
  if (biografia !== (profile.biografia ?? null)) proposal.biografia = biografia;

  const perfil = normalize(values.perfilProfesional);
  if (perfil !== (profile.perfilProfesional ?? null)) proposal.perfilProfesional = perfil;

  if (!sameLines(values.lineasPropuestas, profile.lineasPropuestas)) {
    proposal.lineasPropuestas = [...values.lineasPropuestas].sort();
  }

  if (values.solicitaCorreoPublico !== profile.correoPublicoAutorizado) {
    proposal.solicitaCorreoPublico = values.solicitaCorreoPublico;
    if (values.solicitaCorreoPublico) proposal.versionTextoConsentimiento = consentVersion;
  }

  return proposal;
}

export function hasChanges(proposal: MemberChangeProposal, photo: File | null): boolean {
  return photo !== null || Object.keys(proposal).length > 0;
}
