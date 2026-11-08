import type { ContentBlock, PendingContentBlock } from '@/types/content';

/**
 * Contenido editorial de la red.
 *
 * Criterio: solo se afirma lo que está documentado (nombre, pertenencia al
 * TecNM, objetivo, composición y líneas). Lo que falta se marca como
 * pendiente en lugar de inventarse. Las cifras NO se escriben aquí: los
 * componentes las toman de src/data/statistics.ts.
 */

export const objetivoGeneral =
  'Potenciar la colaboración efectiva entre los investigadores del TecNM para lograr una sola red transversal en nuestro sistema experta en IA y que coadyuve a atender problemáticas específicas del Plan México.';

export const presentacion: ContentBlock = {
  titulo: 'Una red, múltiples perspectivas, un mismo objetivo',
  parrafos: [
    'La Red de Investigación e Innovación en Inteligencia Artificial y Ciencia de Datos (RIIIACD) reúne a investigadoras e investigadores del Tecnológico Nacional de México y de instituciones colaboradoras —institutos tecnológicos, centros de investigación y universidades— en torno a cinco líneas de investigación.',
    'Su propósito es articular en una sola red transversal las capacidades que hoy están distribuidas en distintas instituciones, para que la inteligencia artificial y la ciencia de datos contribuyan a atender problemáticas específicas del Plan México.',
  ],
};

export const quienesSomos: ContentBlock = {
  titulo: '¿Quiénes somos?',
  parrafos: [
    'Somos una red de investigación e innovación del entorno del Tecnológico Nacional de México (TecNM) especializada en inteligencia artificial y ciencia de datos.',
    'La integran investigadoras e investigadores adscritos a institutos tecnológicos, centros de investigación y universidades, organizados en cinco líneas de investigación, cada una con una persona responsable.',
  ],
};

export const contextoOrigen: PendingContentBlock = {
  titulo: 'Contexto y origen',
  parrafos: [
    'La red surge en el entorno del TecNM con la intención de conformar una sola red transversal experta en inteligencia artificial dentro del sistema, alineada con la atención de problemáticas específicas del Plan México.',
  ],
  pendiente:
    'La reseña de antecedentes, fecha de conformación e hitos de la red se publicará cuando la coordinación proporcione la información oficial.',
};

export const importanciaColaboracion: ContentBlock = {
  titulo: 'Por qué colaborar en red',
  parrafos: [
    'Los problemas que hoy se abordan con inteligencia artificial —en salud, educación, agricultura, gestión del territorio o en la propia gobernanza de la IA— rara vez caben en una sola disciplina o en una sola institución.',
    'Trabajar en red permite reunir enfoques complementarios, compartir infraestructura y programas académicos, y dar continuidad a la formación de nuevas generaciones de especialistas. La red busca que esa colaboración sea efectiva y sostenida.',
  ],
};
