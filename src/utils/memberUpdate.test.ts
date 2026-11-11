import { describe, expect, it } from 'vitest';
import type { EditableProfile } from '@/types/memberUpdate';
import { diffProposal, hasChanges, initialValues, validatePhoto, validateProfile } from './memberUpdate';

const profile: EditableProfile = {
  biografia: 'Bio actual',
  perfilProfesional: null,
  lineaInvestigacionId: 'linea-2',
  lineasPropuestas: ['linea-1'],
  correoPublicoAutorizado: false,
  fotoUrl: null,
};

describe('diffProposal', () => {
  it('no propone nada si no hubo cambios', () => {
    const proposal = diffProposal(profile, initialValues(profile), 'v1');
    expect(proposal).toEqual({});
    expect(hasChanges(proposal, null)).toBe(false);
  });

  it('solo incluye los campos modificados', () => {
    const values = { ...initialValues(profile), perfilProfesional: '  Doctora  ', lineasPropuestas: ['linea-3', 'linea-1'] as const };
    expect(diffProposal(profile, { ...values, lineasPropuestas: [...values.lineasPropuestas] }, 'v1')).toEqual({
      perfilProfesional: 'Doctora',
      lineasPropuestas: ['linea-1', 'linea-3'],
    });
  });

  it('vaciar un campo se propone como null', () => {
    expect(diffProposal(profile, { ...initialValues(profile), biografia: '   ' }, 'v1')).toEqual({ biografia: null });
  });

  it('la solicitud de correo público lleva la versión del texto aceptado', () => {
    expect(diffProposal(profile, { ...initialValues(profile), solicitaCorreoPublico: true }, 'v3')).toEqual({
      solicitaCorreoPublico: true,
      versionTextoConsentimiento: 'v3',
    });
  });

  it('una foto nueva cuenta como cambio', () => {
    expect(hasChanges({}, new File(['x'], 'f.png', { type: 'image/png' }))).toBe(true);
  });
});

describe('validaciones', () => {
  it('limita la biografía a 1,000 caracteres', () => {
    expect(validateProfile({ ...initialValues(profile), biografia: 'a'.repeat(1000) }).biografia).toBeUndefined();
    expect(validateProfile({ ...initialValues(profile), biografia: 'a'.repeat(1001) }).biografia).toBeDefined();
  });

  it('acepta JPEG, PNG y WEBP de hasta 2 MB', () => {
    expect(validatePhoto(new File(['x'], 'f.webp', { type: 'image/webp' }))).toBeUndefined();
    expect(validatePhoto(new File(['x'], 'f.gif', { type: 'image/gif' }))).toMatch(/JPEG, PNG o WEBP/);
    const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'f.jpg', { type: 'image/jpeg' });
    expect(validatePhoto(big)).toMatch(/2 MB/);
  });
});
