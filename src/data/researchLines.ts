import type { ResearchLine, ResearchLineId } from '@/types/research';

/**
 * Las cinco líneas oficiales de investigación de RIIIACD.
 *
 * Nombres y responsables: documentación institucional proporcionada.
 * Descripciones: redacción breve derivada del nombre oficial de cada línea.
 * Deben revisarse y sustituirse por las descripciones oficiales cuando
 * se cuente con ellas. No se listan proyectos, publicaciones ni resultados.
 */
export const researchLines: ResearchLine[] = [
  {
    id: 'linea-1',
    numero: 1,
    slug: 'algoritmos-modelado-optimizacion',
    nombre: 'Diseño de algoritmos para modelado y optimización de sistemas complejos',
    nombreCorto: 'Algoritmos, modelado y optimización',
    descripcion:
      'Aborda el diseño de algoritmos para representar, modelar y optimizar sistemas complejos, con el propósito de apoyar la toma de decisiones mediante métodos computacionales.',
    ejes: ['Diseño de algoritmos', 'Modelado', 'Optimización', 'Sistemas complejos'],
    responsableId: 'm-ernesto-de-la-cruz-nicolas',
    palabrasClave: ['algoritmo', 'algoritmos', 'modelado', 'optimizacion', 'sistemas complejos'],
  },
  {
    id: 'linea-2',
    numero: 2,
    slug: 'ia-ciencia-datos-mundo-real',
    nombre: 'Inteligencia Artificial y Ciencia de Datos aplicados a problemas del mundo real',
    nombreCorto: 'IA y ciencia de datos aplicadas',
    descripcion:
      'Orienta las técnicas de inteligencia artificial y ciencia de datos hacia la atención de problemas concretos del entorno social, productivo e institucional.',
    ejes: ['Inteligencia artificial', 'Ciencia de datos', 'Problemas del mundo real'],
    responsableId: 'm-norma-ramirez-perez',
    palabrasClave: ['mundo real', 'aplicados', 'aplicada', 'problemas reales'],
  },
  {
    id: 'linea-3',
    numero: 3,
    slug: 'inteligencia-geoespacial',
    nombre: 'Inteligencia Geoespacial para la Gestión Inteligente del Territorio',
    nombreCorto: 'Inteligencia geoespacial',
    descripcion:
      'Integra datos geoespaciales con inteligencia artificial para analizar el territorio y apoyar su gestión de manera informada.',
    ejes: ['Inteligencia geoespacial', 'Gestión del territorio'],
    responsableId: 'm-laura-flores-lopez',
    palabrasClave: ['geoespacial', 'territorio', 'territorial', 'sig', 'gis', 'geografic'],
  },
  {
    id: 'linea-4',
    numero: 4,
    slug: 'etica-gobernanza-ia',
    nombre: 'Ética, Gobernanza, Transparencia y Evaluación de IA',
    nombreCorto: 'Ética y gobernanza de la IA',
    descripcion:
      'Atiende las dimensiones éticas, de gobernanza, transparencia y evaluación de los sistemas de inteligencia artificial, para su desarrollo y uso responsables.',
    ejes: ['Ética', 'Gobernanza', 'Transparencia', 'Evaluación de IA'],
    responsableId: 'm-eddie-clemente-torres',
    palabrasClave: ['etica', 'gobernanza', 'transparencia', 'evaluacion de ia', 'responsable'],
  },
  {
    id: 'linea-5',
    numero: 5,
    slug: 'ia-salud-educacion-agricultura',
    nombre: 'Inteligencia artificial y ciencia de datos en salud, educación y agricultura',
    nombreCorto: 'IA en salud, educación y agricultura',
    descripcion:
      'Aplica la inteligencia artificial y la ciencia de datos en tres sectores prioritarios: salud, educación y agricultura.',
    ejes: ['Salud', 'Educación', 'Agricultura'],
    responsableId: 'm-maria-hernandez-perez',
    palabrasClave: ['salud', 'educacion', 'agricultura', 'agricola', 'medic'],
  },
];

const researchLineById = new Map<ResearchLineId, ResearchLine>(
  researchLines.map((line) => [line.id, line]),
);

export function getResearchLineById(id: ResearchLineId | null | undefined): ResearchLine | undefined {
  return id ? researchLineById.get(id) : undefined;
}

export function getResearchLineBySlug(slug: string | undefined): ResearchLine | undefined {
  return researchLines.find((line) => line.slug === slug);
}
