/**
 * Contraste WCAG 2.x (luminancia relativa). Se usa en las pruebas para
 * garantizar el criterio de aceptación: ningún texto por debajo de 4.5:1.
 */

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? [...clean].map((c) => c + c).join('') : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`Color hexadecimal no válido: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(channel) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Mezcla `percent` % de `top` sobre `base` (equivale a color-mix en sRGB o a una opacidad). */
export function mixHex(top: string, base: string, percent: number): string {
  const t = parseHex(top);
  const b = parseHex(base);
  const p = percent / 100;
  return `#${t
    .map((v, i) =>
      Math.round(v * p + b[i]! * (1 - p))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}
