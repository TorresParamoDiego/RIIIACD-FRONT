/**
 * Contenido editorial institucional. Los bloques marcados como pendientes
 * se muestran con un aviso en lugar de inventar información.
 */
export interface ContentBlock {
  titulo: string;
  parrafos: string[];
}

export interface PendingContentBlock {
  titulo: string;
  /** Mensaje que explica qué información falta y quién debe proporcionarla. */
  pendiente: string;
  /** Datos ya documentados que sí pueden mostrarse. */
  parrafos: string[];
}

export interface NavItem {
  label: string;
  to: string;
}
