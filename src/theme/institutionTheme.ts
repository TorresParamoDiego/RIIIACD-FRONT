import type { InstitutionType } from '@/types/institution';

/** Color por tipo de institución, compartido por la barra de la portada, la leyenda y la gráfica. */
export const institutionTypeColors: Record<InstitutionType, string> = {
  tecnologico: '#2563EB',
  'centro-investigacion': '#22D3EE',
  universidad: '#123C68',
};
