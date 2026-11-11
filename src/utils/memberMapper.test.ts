import { describe, expect, it } from 'vitest';
import { publicMembers } from '@/data/members';
import { PUBLIC_MEMBER_FIELDS, type MemberRecord } from '@/types/member';
import { importMemberRows, toPublicMember } from './memberMapper';

/** Campos administrativos que jamás deben llegar al sitio público. */
const FORBIDDEN = [
  'cvuTecNM',
  'cvuConahcyt',
  'archivoCvuTecNM',
  'archivoCvuConahcyt',
  'telefonoParticular',
  'correoPersonal',
  'correoInstitucional',
  'archivoCartaCompromiso',
  'scopusAuthorId',
  'infraestructura',
  'programasAcademicos',
  'solicitaCorreoPublico',
  'consentimientoCorreo',
];

const baseRecord: MemberRecord = {
  id: 'm-ana-perez',
  numero: 1,
  nombres: 'Ana',
  apellidos: 'Pérez López',
  nombreCompleto: 'Ana Pérez López',
  cvuTecNM: '123456',
  archivoCvuTecNM: 'cvu.pdf',
  cvuConahcyt: '987654',
  correoInstitucional: 'ana.perez@celaya.tecnm.mx',
  telefonoParticular: '4610000000',
  correoPersonal: 'ana@example.com',
  institucion: 'Tecnológico de Celaya',
  institucionId: 'it-celaya',
  rol: 'Integrante',
  archivoCartaCompromiso: 'carta.pdf',
  lineaInvestigacionId: 'linea-2',
  biografia: '  Investigadora en aprendizaje automático.  ',
  perfilProfesional: 'Doctora en Ciencias de la Computación',
  lineasPropuestas: ['linea-1', 'linea-2'],
  solicitaCorreoPublico: true,
  consentimientoCorreo: null,
};

describe('toPublicMember', () => {
  it('solo devuelve campos de la lista blanca', () => {
    const pub = toPublicMember({
      ...baseRecord,
      consentimientoCorreo: { aprobadoEn: '2026-11-01', versionTexto: 'v1', aprobadoPor: 'coord' },
    });
    for (const key of Object.keys(pub)) expect(PUBLIC_MEMBER_FIELDS).toContain(key);
    for (const key of FORBIDDEN) expect(pub).not.toHaveProperty(key);
    expect(JSON.stringify(pub)).not.toMatch(/123456|987654|4610000000|ana@example\.com|carta\.pdf|cvu\.pdf/);
  });

  it('no publica el correo si solo existe la solicitud del integrante', () => {
    expect(toPublicMember(baseRecord).correoPublico).toBeUndefined();
  });

  it('publica el correo cuando la autorización está aprobada', () => {
    const pub = toPublicMember({
      ...baseRecord,
      consentimientoCorreo: { aprobadoEn: '2026-11-01', versionTexto: 'v1', aprobadoPor: 'coord' },
    });
    expect(pub.correoPublico).toBe('ana.perez@celaya.tecnm.mx');
  });

  it('incluye los campos nuevos del perfil, limpios', () => {
    const pub = toPublicMember(baseRecord);
    expect(pub.biografia).toBe('Investigadora en aprendizaje automático.');
    expect(pub.perfilProfesional).toBe('Doctora en Ciencias de la Computación');
    // La línea principal no se repite entre las adicionales.
    expect(pub.lineasPropuestas).toEqual(['linea-1']);
  });

  it('recorta la biografía a 1,000 caracteres', () => {
    expect(toPublicMember({ ...baseRecord, biografia: 'a'.repeat(1500) }).biografia).toHaveLength(1000);
  });
});

describe('importMemberRows', () => {
  it('lee CVU y teléfono como texto aunque Excel los entregue como número, y normaliza ROLL', () => {
    const result = importMemberRows([
      {
        NOMBRES: '  ana  ',
        APELLIDOS: 'PÉREZ lópez',
        'NÚMERO CVU TecNM': 123456,
        'CORREO INSTITUCIONAL': ' ANA.PEREZ@Celaya.TecNM.mx ',
        ROLL: 'integrante',
      },
    ]);
    const record = result.registros[0]!;
    expect(record.cvuTecNM).toBe('123456');
    expect(typeof record.cvuTecNM).toBe('string');
    expect(record.correoInstitucional).toBe('ana.perez@celaya.tecnm.mx');
    expect(record.solicitaCorreoPublico).toBe(false);
    expect(record.consentimientoCorreo).toBeNull();
  });
});

describe('datos públicos locales', () => {
  it('no contienen campos administrativos', () => {
    for (const member of publicMembers) {
      for (const key of FORBIDDEN) expect(member).not.toHaveProperty(key);
    }
  });
});
