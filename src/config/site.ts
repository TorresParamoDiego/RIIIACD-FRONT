import type { NavItem } from '@/types/content';

/**
 * Configuración institucional central. Cualquier dato que aparezca en más de
 * un componente (nombre de la red, correo, rutas) se toma de aquí.
 */
export const siteConfig = {
  siglas: 'RIIIACD',
  nombre: 'Red de Investigación e Innovación en Inteligencia Artificial y Ciencia de Datos',
  nombreBreve: 'Red de Investigación e Innovación en IA y Ciencia de Datos',
  lema:
    'Conectando talento, conocimiento e innovación para transformar los desafíos de México mediante la inteligencia artificial y la ciencia de datos.',
  correoContacto: 'eddie.ct@cenidet.tecnm.mx',
  /** Id del integrante que lidera la red (ver src/data/members.ts). */
  liderRedId: 'm-eddie-clemente-torres',
  institucionMatriz: {
    nombre: 'Tecnológico Nacional de México',
    siglas: 'TecNM',
    url: 'https://www.tecnm.mx',
  },
} as const;

export const ROUTES = {
  inicio: '/',
  nosotros: '/nosotros',
  lineas: '/lineas-investigacion',
  integrantes: '/integrantes',
  instituciones: '/instituciones',
  contacto: '/contacto',
} as const;

export const mainNavigation: NavItem[] = [
  { label: 'Inicio', to: ROUTES.inicio },
  { label: 'Nosotros', to: ROUTES.nosotros },
  { label: 'Líneas de investigación', to: ROUTES.lineas },
  { label: 'Integrantes', to: ROUTES.integrantes },
  { label: 'Instituciones', to: ROUTES.instituciones },
  { label: 'Contacto', to: ROUTES.contacto },
];

export function researchLinePath(slug: string): string {
  return `${ROUTES.lineas}/${slug}`;
}
