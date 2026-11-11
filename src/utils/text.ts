/** Quita acentos y diacríticos conservando la ñ como n (útil para búsquedas). */
export function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Clave de comparación: minúsculas, sin acentos, sin signos y con espacios simples. */
export function toSearchKey(value: string): string {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9@.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Colapsa espacios repetidos (incluidos saltos de línea y espacios duros). */
export function collapseWhitespace(value: string): string {
  return value.replace(/[\s\u00A0]+/g, ' ').trim();
}

/** Iniciales para monogramas: primera letra del primer nombre y del primer apellido. */
export function getInitials(nombres: string, apellidos: string): string {
  const first = nombres.trim().charAt(0);
  const particles = new Set(['de', 'del', 'la', 'las', 'los', 'y']);
  const surname = apellidos
    .trim()
    .split(/\s+/)
    .find((word) => !particles.has(word.toLowerCase()));
  return `${first}${surname?.charAt(0) ?? ''}`.toUpperCase();
}

export function slugify(value: string): string {
  return toSearchKey(value)
    .replace(/[\s.@]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Pluralización simple en español para contadores. */
export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count.toLocaleString('es-MX')} ${count === 1 ? singular : pluralForm}`;
}
