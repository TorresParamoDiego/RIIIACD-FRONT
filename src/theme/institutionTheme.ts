import type { InstitutionType } from '@/types/institution';

/** Color por tipo de institución, compartido por la barra de la portada, la leyenda y la gráfica. */
// Elementos gráficos (barras, muestras): ≥ 3:1 con blanco y distinguibles por
// tono y luminosidad. Azul 11.41:1 · verde 5.81:1 · azul medio 3.69:1.
// Nunca se usan como color de texto; las etiquetas van en `ink`.
export const institutionTypeColors: Record<InstitutionType, string> = {
  tecnologico: '#1B396A',
  'centro-investigacion': '#117533',
  universidad: '#5B86C9',
};
