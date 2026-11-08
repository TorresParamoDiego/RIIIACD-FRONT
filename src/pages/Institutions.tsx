import { useMemo, useState } from 'react';
import { InstitutionCard } from '@/components/institutions/InstitutionCard';
import { InstitutionChart } from '@/components/institutions/InstitutionChart';
import { LoadingState } from '@/components/common/LoadingState';
import { DemoNotice } from '@/components/common/Notice';
import { PageHeader } from '@/components/common/PageHeader';
import { Reveal } from '@/components/common/Reveal';
import { EmptyState, ErrorState } from '@/components/common/StatusMessage';
import { institutionTypes } from '@/data/institutions';
import { networkStatistics } from '@/data/statistics';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useInstitutions } from '@/hooks/useInstitutions';
import { useMembers } from '@/hooks/useMembers';
import { ALL } from '@/types/filters';
import type { InstitutionType } from '@/types/institution';
import { cn } from '@/utils/cn';
import { sortInstitutions, withMemberCounts } from '@/utils/institutions';

type TypeFilter = InstitutionType | typeof ALL;

export default function Institutions() {
  useDocumentTitle('Instituciones');
  const institutionsResource = useInstitutions();
  const membersResource = useMembers();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(ALL);

  const status =
    institutionsResource.status === 'error' || membersResource.status === 'error'
      ? 'error'
      : institutionsResource.status === 'loading' || membersResource.status === 'loading'
        ? 'loading'
        : 'success';

  const catalog = useMemo(
    () => sortInstitutions(withMemberCounts(institutionsResource.data ?? [], membersResource.members)),
    [institutionsResource.data, membersResource.members],
  );
  const visible = typeFilter === ALL ? catalog : catalog.filter((inst) => inst.tipo === typeFilter);
  const confirmedCount = catalog.filter((inst) => !inst.esDemostrativo).length;
  const hasDemo = catalog.some((inst) => inst.esDemostrativo);

  const filterOptions: { value: TypeFilter; label: string; count: number }[] = [
    { value: ALL, label: 'Todas', count: catalog.length },
    ...institutionTypes.map((type) => ({
      value: type.id,
      label: type.etiquetaPlural,
      count: catalog.filter((inst) => inst.tipo === type.id).length,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Instituciones participantes"
        breadcrumbs={[{ label: 'Instituciones' }]}
        description={`La red integra a ${networkStatistics.instituciones} instituciones: institutos tecnológicos, centros de investigación y universidades.`}
      />

      <section aria-labelledby="composicion-titulo" className="py-14 sm:py-20">
        <Reveal className="container-page grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <h2 id="composicion-titulo" className="font-display text-[1.75rem] leading-tight font-semibold text-navy-950 sm:text-[2.125rem]">
              Composición de la red
            </h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-muted">
              De las {networkStatistics.instituciones} instituciones que participan,{' '}
              {institutionTypes
                .map((t) => `${networkStatistics.institucionesPorTipo[t.id]} son ${t.etiquetaPlural.toLowerCase()}`)
                .join(', ')
                .replace(/, ([^,]*)$/, ' y $1')}
              .
            </p>
          </div>
          <div className="rounded-panel border border-rule bg-white p-5 shadow-card sm:p-7 lg:col-span-7">
            <InstitutionChart />
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="catalogo-titulo" className="border-t border-rule bg-mist py-14 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="catalogo-titulo" className="font-display text-[1.75rem] leading-tight font-semibold text-navy-950 sm:text-[2.125rem]">
                Catálogo de instituciones
              </h2>
              <p className="mt-3 max-w-[60ch] text-ink-muted">
                {confirmedCount < networkStatistics.instituciones
                  ? `Por ahora el catálogo incluye ${confirmedCount} de ${networkStatistics.instituciones} instituciones confirmadas; el resto se incorporará a partir del registro de integrantes.`
                  : 'Filtra por tipo para consultar las instituciones y sus integrantes.'}
              </p>
            </div>

            <div role="group" aria-label="Filtrar por tipo de institución" className="flex flex-wrap gap-2">
              {filterOptions.map((option) => {
                const active = option.value === typeFilter;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTypeFilter(option.value)}
                    className={cn(
                      'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[0.9375rem] font-medium transition-colors',
                      active
                        ? 'border-navy-950 bg-navy-950 text-white'
                        : 'border-rule-strong bg-white text-navy-950 hover:border-navy-800',
                    )}
                  >
                    {option.label}
                    <span className={cn('tabular-nums', active ? 'text-white/70' : 'text-ink-subtle')}>{option.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {hasDemo ? (
            <DemoNotice title="Incluye instituciones demostrativas" className="mt-8">
              Las tarjetas marcadas como «Demo» no corresponden a instituciones reales; sirven para probar el catálogo
              mientras se integra la información oficial.
            </DemoNotice>
          ) : null}

          <div className="mt-8">
            {status === 'loading' ? <LoadingState skeletonCount={6} label="Cargando instituciones…" /> : null}
            {status === 'error' ? (
              <ErrorState
                error={institutionsResource.error ?? membersResource.error}
                onRetry={() => {
                  institutionsResource.retry();
                  membersResource.retry();
                }}
              />
            ) : null}
            {status === 'success' && visible.length === 0 ? (
              <EmptyState
                title="Aún no hay instituciones de este tipo en el catálogo"
                description="Se mostrarán aquí en cuanto se registren."
                onReset={() => setTypeFilter(ALL)}
                resetLabel="Ver todas"
              />
            ) : null}
            {status === 'success' && visible.length > 0 ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visible.map((institution) => (
                  <li key={institution.id}>
                    <InstitutionCard institution={institution} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
