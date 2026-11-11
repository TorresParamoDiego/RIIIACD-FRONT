// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { institutionTypeColors } from '@/theme/institutionTheme';
import { lineThemes, NEUTRAL_LINE_COLOR } from '@/theme/lineThemes';
import { contrastRatio, mixHex } from './contrast';

const AA_TEXT = 4.5;
const AA_GRAPHIC = 3;

/** Lee los tokens `--color-*` de globals.css para probar los valores reales. */
const css = readFileSync(new URL('../styles/globals.css', import.meta.url), 'utf8');
const token = (name: string): string => {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match?.[1]) throw new Error(`Token --color-${name} no encontrado`);
  return match[1];
};

describe('fórmula de contraste', () => {
  it('reproduce las cifras verificadas en el brief', () => {
    expect(contrastRatio('#FFFFFF', '#117533')).toBeCloseTo(5.81, 2);
    expect(contrastRatio('#FFFFFF', '#1B396A')).toBeCloseTo(11.41, 2);
    expect(contrastRatio('#117533', '#F3F6FA')).toBeCloseTo(5.36, 2);
    expect(contrastRatio('#44546B', '#FFFFFF')).toBeCloseTo(7.7, 1);
  });
});

describe('tokens de marca (texto ≥ 4.5:1)', () => {
  const white = '#ffffff';
  const pairs: [string, string, string][] = [
    ['blanco sobre brand-blue', white, token('brand-blue')],
    ['blanco sobre brand-blue-deep', white, token('brand-blue-deep')],
    ['blanco sobre brand-green (botón primario)', white, token('brand-green')],
    ['blanco sobre brand-green-hover', white, token('brand-green-hover')],
    ['brand-green sobre blanco (enlaces)', token('brand-green'), white],
    ['brand-green-hover sobre blanco', token('brand-green-hover'), white],
    ['brand-green sobre mist', token('brand-green'), token('mist')],
    ['brand-green sobre brand-green-50', token('brand-green'), token('brand-green-50')],
    ['ink sobre brand-green-50 (hover onDark)', token('ink'), token('brand-green-50')],
    ['brand-accent sobre brand-blue', token('brand-accent'), token('brand-blue')],
    ['brand-blue sobre mist', token('brand-blue'), token('mist')],
    ['ink-muted sobre blanco', token('ink-muted'), white],
    ['ink-muted sobre mist', token('ink-muted'), token('mist')],
    ['ink-subtle sobre blanco', token('ink-subtle'), white],
    ['ink-subtle sobre mist', token('ink-subtle'), token('mist')],
    ['danger sobre danger-50', token('danger'), token('danger-50')],
    // Texto blanco con opacidad sobre el azul (pie, hero, encabezados).
    ['blanco 60 % sobre brand-blue', mixHex(white, token('brand-blue'), 60), token('brand-blue')],
    ['blanco 70 % sobre el halo del hero (#264A82)', mixHex(white, '#264a82', 70), '#264a82'],
  ];

  it.each(pairs)('%s', (_label, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('el verde nunca sirve como texto sobre el azul (documentado)', () => {
    expect(contrastRatio(token('brand-green'), token('brand-blue'))).toBeLessThan(AA_TEXT);
  });

  it('ya no existen los tokens antiguos ni el cian', () => {
    expect(css).not.toMatch(/--color-(navy|electric)-|--color-signal|#22d3ee/i);
  });
});

describe('paleta de líneas de investigación', () => {
  it.each(Object.entries(lineThemes))('%s cumple AA en claro y en oscuro', (_id, theme) => {
    expect(contrastRatio(theme.color, '#ffffff')).toBeGreaterThanOrEqual(AA_TEXT);
    // Insignias: texto del color sobre su propio tinte (tint(color, 8–10)).
    expect(contrastRatio(theme.color, mixHex(theme.color, '#ffffff', 10))).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(theme.colorOnDark, token('brand-blue'))).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(theme.colorOnDark, mixHex(theme.colorOnDark, token('brand-blue'), 16))).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('las cinco líneas tienen colores distintos', () => {
    const colors = Object.values(lineThemes).flatMap((t) => [t.color.toLowerCase(), t.colorOnDark.toLowerCase()]);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('el color neutro cumple AA sobre blanco', () => {
    expect(contrastRatio(NEUTRAL_LINE_COLOR, '#ffffff')).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

describe('colores por tipo de institución (gráficos ≥ 3:1)', () => {
  const colors = Object.values(institutionTypeColors);
  it.each(colors)('%s se distingue del fondo blanco', (color) => {
    expect(contrastRatio(color, '#ffffff')).toBeGreaterThanOrEqual(AA_GRAPHIC);
  });
  it('no repite colores', () => {
    expect(new Set(colors.map((c) => c.toLowerCase())).size).toBe(colors.length);
  });
});
