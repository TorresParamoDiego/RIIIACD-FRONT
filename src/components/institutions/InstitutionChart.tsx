import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { institutionTypes } from '@/data/institutions';
import { networkStatistics } from '@/data/statistics';
import { institutionTypeColors } from '@/theme/institutionTheme';

interface ChartDatum {
  tipo: string;
  instituciones: number;
  color: string;
}

/** Composición oficial de la red por tipo de institución (src/data/statistics.ts). */
export function InstitutionChart() {
  const data: ChartDatum[] = institutionTypes.map((type) => ({
    tipo: type.etiquetaPlural,
    instituciones: networkStatistics.institucionesPorTipo[type.id],
    color: institutionTypeColors[type.id],
  }));

  return (
    <figure>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 0 }} barCategoryGap={14}>
            <XAxis type="number" hide domain={[0, 'dataMax']} />
            <YAxis
              type="category"
              dataKey="tipo"
              width={168}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#44546B', fontSize: 14 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }}
              contentStyle={{ borderRadius: 10, borderColor: '#DCE3EC', fontSize: 14 }}
            />
            <Bar dataKey="instituciones" name="Instituciones" radius={[0, 6, 6, 0]} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.tipo} fill={entry.color} />
              ))}
              <LabelList dataKey="instituciones" position="right" fill="#071B35" fontSize={15} fontWeight={600} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        {data.map((d) => `${d.instituciones} ${d.tipo.toLowerCase()}`).join(', ')}
      </figcaption>
    </figure>
  );
}
