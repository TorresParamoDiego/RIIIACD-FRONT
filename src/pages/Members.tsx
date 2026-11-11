import { useMemo, useRef } from 'react';
import { DemoNotice } from '@/components/common/Notice';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState, ErrorState } from '@/components/common/StatusMessage';
import { MemberCard } from '@/components/members/MemberCard';
import { MemberDetails } from '@/components/members/MemberDetails';
import { MemberFilters, type MemberFilterOptions } from '@/components/members/MemberFilters';
import { MemberSearch } from '@/components/members/MemberSearch';
import { Pagination } from '@/components/members/Pagination';
import { MEMBERS_PAGE_SIZE } from '@/config/dataSource';
import { UNCONFIRMED_INSTITUTION_LABEL } from '@/data/institutions';
import { getResearchLineById, researchLines } from '@/data/researchLines';
import { networkStatistics } from '@/data/statistics';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useInstitutions } from '@/hooks/useInstitutions';
import { useMemberFilters } from '@/hooks/useMemberFilters';
import { useMembers } from '@/hooks/useMembers';
import { ALL, UNASSIGNED, type SelectOption } from '@/types/filters';
import type { Institution } from '@/types/institution';
import type { PublicMember } from '@/types/member';
import { countBy, filterMembers, hasActiveFilters, paginate, sortMembers } from '@/utils/filters';
import { plural } from '@/utils/text';

const collator = new Intl.Collator('es-MX', { sensitivity: 'base' });

function buildFilterOptions(members: PublicMember[], institutions: Institution[]): MemberFilterOptions {
  const byInstitution = countBy(members, (m) => m.institucionId);
  const byLine = countBy(members, (m) => m.lineaInvestigacionId);
  const byRole = countBy(members, (m) => m.rol);

  const instituciones: SelectOption[] = [
    { value: ALL, label: 'Todas las instituciones' },
    ...institutions
      .filter((inst) => byInstitution.has(inst.id))
      .sort((a, b) => collator.compare(a.nombre, b.nombre))
      .map((inst) => ({ value: inst.id, label: inst.siglas ?? inst.nombre, count: byInstitution.get(inst.id) })),
  ];
  const unassignedInstitutions = byInstitution.get(null);
  if (unassignedInstitutions) {
    instituciones.push({ value: UNASSIGNED, label: UNCONFIRMED_INSTITUTION_LABEL, count: unassignedInstitutions });
  }

  const lineas: MemberFilterOptions['lineas'] = [
    { value: ALL, label: 'Todas las líneas' },
    ...researchLines.map((line) => ({
      value: line.id,
      label: `Línea ${line.numero}: ${line.nombreCorto}`,
      count: byLine.get(line.id) ?? 0,
    })),
  ];
  const unassignedLines = byLine.get(null);
  if (unassignedLines) lineas.push({ value: UNASSIGNED, label: 'Línea por definir', count: unassignedLines });

  const roles: SelectOption[] = [
    { value: ALL, label: 'Todos los roles' },
    ...[...byRole.entries()]
      .filter((entry): entry is [string, number] => entry[0] !== null)
      .sort(([a], [b]) => collator.compare(a, b))
      .map(([rol, count]) => ({ value: rol, label: rol, count })),
  ];

  return { instituciones, lineas, roles };
}

export default function Members() {
  useDocumentTitle('Integrantes');
  const membersResource = useMembers();
  const institutionsResource = useInstitutions();
  const { filters, setFilters, resetFilters, selectedMemberId, openMember, closeMember } = useMemberFilters();
  const resultsRef = useRef<HTMLHeadingElement>(null);

  const institutions = useMemo(() => institutionsResource.data ?? [], [institutionsResource.data]);
  const institutionById = useMemo(() => new Map(institutions.map((i) => [i.id, i])), [institutions]);
  const { members } = membersResource;

  const status =
    membersResource.status === 'error' || institutionsResource.status === 'error'
      ? 'error'
      : membersResource.status === 'loading' || institutionsResource.status === 'loading'
        ? 'loading'
        : 'success';

  const options = useMemo(() => buildFilterOptions(members, institutions), [members, institutions]);
  const results = useMemo(() => sortMembers(filterMembers(members, filters), filters.orden), [members, filters]);
  const page = paginate(results, filters.pagina, MEMBERS_PAGE_SIZE);

  const activeCount =
    [filters.institucion, filters.linea, filters.rol].filter((value) => value !== ALL).length + (filters.query.trim() ? 1 : 0);

  const institutionNameFor = (member: PublicMember): string => {
    const inst = institutionById.get(member.institucionId ?? '');
    return inst ? inst.nombre : UNCONFIRMED_INSTITUTION_LABEL;
  };

  const selected = status === 'success' ? membersResource.getById(selectedMemberId) : undefined;

  const goToPage = (next: number): void => {
    setFilters({ pagina: next });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <PageHeader
        title="Directorio de integrantes"
        breadcrumbs={[{ label: 'Integrantes' }]}
        description="Investigadoras e investigadores que forman parte de la red. Busca por nombre o filtra por institución, línea de investigación y rol."
      />

      <section className="py-12 sm:py-16" aria-labelledby="resultados-titulo">
        <div className="container-page">
          {membersResource.includesDemoData ? (
            <DemoNotice title="Directorio con datos demostrativos" className="mb-8">
              Se muestran los responsables documentados de la red y registros de prueba marcados como «Demo». El padrón oficial de{' '}
              {networkStatistics.integrantes} integrantes se incorporará a partir del registro institucional.
            </DemoNotice>
          ) : null}

          <div className="rounded-panel border border-rule bg-mist/60 p-5 sm:p-6">
            <MemberSearch value={filters.query} onChange={(query) => setFilters({ query })} />
            <div className="mt-5">
              <MemberFilters filters={filters} options={options} activeCount={activeCount} onChange={setFilters} onReset={resetFilters} />
            </div>
          </div>

          <div className="mt-10 flex scroll-mt-28 flex-wrap items-baseline justify-between gap-2" ref={resultsRef}>
            <h2 id="resultados-titulo" className="text-[1.0625rem] font-semibold text-ink">
              Resultados
            </h2>
            {status === 'success' ? (
              <p className="text-[0.9375rem] text-ink-muted" aria-live="polite">
                {page.totalItems === 0
                  ? 'Sin coincidencias'
                  : `Mostrando ${page.from}–${page.to} de ${plural(page.totalItems, 'integrante', 'integrantes')}`}
              </p>
            ) : null}
          </div>

          <div className="mt-5">
            {status === 'loading' ? <LoadingState skeletonCount={6} label="Cargando directorio…" /> : null}

            {status === 'error' ? (
              <ErrorState
                title="No se pudo cargar el directorio"
                error={membersResource.error ?? institutionsResource.error}
                onRetry={() => {
                  membersResource.retry();
                  institutionsResource.retry();
                }}
              />
            ) : null}

            {status === 'success' && page.totalItems === 0 ? (
              <EmptyState
                onReset={hasActiveFilters(filters) ? resetFilters : undefined}
                description={
                  filters.query
                    ? `Nadie en el directorio coincide con «${filters.query}» y los filtros elegidos. Revisa la ortografía o quita algún filtro.`
                    : undefined
                }
              />
            ) : null}

            {status === 'success' && page.totalItems > 0 ? (
              <>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {page.items.map((member) => (
                    <li key={member.id}>
                      <MemberCard
                        member={member}
                        institutionName={institutionNameFor(member)}
                        line={getResearchLineById(member.lineaInvestigacionId)}
                        onOpen={openMember}
                      />
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Pagination page={page.page} totalPages={page.totalPages} onPageChange={goToPage} />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <MemberDetails
        member={selected}
        institution={selected ? institutionById.get(selected.institucionId ?? '') : undefined}
        institutionName={selected ? institutionNameFor(selected) : ''}
        line={getResearchLineById(selected?.lineaInvestigacionId)}
        onClose={closeMember}
      />
    </>
  );
}
