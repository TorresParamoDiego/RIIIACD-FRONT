type ClassValue = string | false | null | undefined;

/** Une clases condicionales de Tailwind sin dependencias externas. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
