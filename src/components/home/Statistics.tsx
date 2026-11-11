import { institutionTypes } from '@/data/institutions';
import { networkStatistics } from '@/data/statistics';
import { institutionTypeColors } from '@/theme/institutionTheme';
import { cn } from '@/utils/cn';

interface StatisticsProps {
  /** `overlap` se superpone al borde inferior del hero en la portada. */
  variant?: 'overlap' | 'plain';
  className?: string;
}

/**
 * Indicadores de la red. Todas las cifras provienen de src/data/statistics.ts.
 * La barra muestra la proporción real de cada tipo de institución.
 */
export function Statistics({ variant = 'overlap', className }: StatisticsProps) {
  const { integrantes, instituciones, institucionesPorTipo } = networkStatistics;

  return (
    <section aria-labelledby="estadisticas-titulo" className={cn(variant === 'overlap' && 'relative z-10 -mt-14 sm:-mt-16', className)}>
      <h2 id="estadisticas-titulo" className="sr-only">
        La red en cifras
      </h2>
      <div className={cn(variant === 'overlap' && 'container-page')}>
        <div className="grid overflow-hidden rounded-panel border border-rule bg-white shadow-raised md:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)]">
          <dl className="flex flex-col justify-between gap-2 border-b border-rule p-7 sm:p-9 md:border-r md:border-b-0">
            <dt className="order-2 text-[1.0625rem] font-medium text-ink-muted">Integrantes de la red</dt>
            <dd className="order-1 font-display text-[4rem] leading-none font-semibold tracking-tight text-ink tabular-nums sm:text-[4.75rem]">
              {integrantes}
            </dd>
          </dl>

          <div className="p-7 sm:p-9">
            <dl className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <dd className="font-display text-[2.5rem] leading-none font-semibold tracking-tight text-ink tabular-nums">
                {instituciones}
              </dd>
              <dt className="text-[1.0625rem] font-medium text-ink-muted">instituciones participantes</dt>
            </dl>

            <div
              className="mt-6 flex h-3 w-full gap-0.5 overflow-hidden rounded-full"
              role="img"
              aria-label={institutionTypes.map((t) => `${institucionesPorTipo[t.id]} ${t.etiquetaPlural.toLowerCase()}`).join(', ')}
            >
              {institutionTypes.map((type) => (
                <span
                  key={type.id}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{
                    flexGrow: institucionesPorTipo[type.id],
                    flexBasis: 0,
                    minWidth: '0.5rem',
                    backgroundColor: institutionTypeColors[type.id],
                  }}
                />
              ))}
            </div>

            <dl className="mt-6 grid gap-5 sm:grid-cols-3">
              {institutionTypes.map((type) => (
                <div key={type.id} className="flex items-start gap-3">
                  <span
                    className="mt-2 size-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: institutionTypeColors[type.id] }}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col">
                    <dd className="order-1 font-display text-[1.75rem] leading-tight font-semibold text-ink tabular-nums">
                      {institucionesPorTipo[type.id]}
                    </dd>
                    <dt className="order-2 text-[0.9375rem] text-ink-muted">{type.etiquetaPlural}</dt>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
