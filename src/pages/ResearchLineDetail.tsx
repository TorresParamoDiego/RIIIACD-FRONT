import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Users } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { LoadingState } from '@/components/common/LoadingState';
import { Monogram } from '@/components/common/Monogram';
import { PendingContent } from '@/components/common/Notice';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorState } from '@/components/common/StatusMessage';
import { ROUTES, researchLinePath } from '@/config/site';
import { getInstitutionById, UNCONFIRMED_INSTITUTION_LABEL } from '@/data/institutions';
import { getResearchLineBySlug, researchLines } from '@/data/researchLines';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMembers } from '@/hooks/useMembers';
import { lineThemes, tint } from '@/theme/lineThemes';
import { formatMemberName } from '@/utils/members';
import { plural } from '@/utils/text';
import NotFound from './NotFound';

export default function ResearchLineDetail() {
  const { slug } = useParams<{ slug: string }>();
  const line = getResearchLineBySlug(slug);
  useDocumentTitle(line ? `Línea ${line.numero}` : 'Línea no encontrada');
  const { status, members, error, retry, getById } = useMembers();

  const lineMembers = useMemo(
    () => (line ? members.filter((m) => m.lineaInvestigacionId === line.id) : []),
    [members, line],
  );

  if (!line) return <NotFound />;

  const theme = lineThemes[line.id];
  const Icon = theme.icon;
  const responsable = getById(line.responsableId);
  const index = researchLines.findIndex((l) => l.id === line.id);
  const previous = researchLines[index - 1];
  const next = researchLines[index + 1];

  return (
    <>
      <PageHeader
        title={line.nombre}
        breadcrumbs={[{ label: 'Líneas de investigación', to: ROUTES.lineas }, { label: `Línea ${line.numero}` }]}
      >
        <div className="flex items-center gap-3">
          <span
            className="grid size-11 place-items-center rounded-control"
            style={{ backgroundColor: tint(theme.colorOnDark, 16, 'transparent'), color: theme.colorOnDark }}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <span className="text-[0.9375rem] font-semibold" style={{ color: theme.colorOnDark }}>
            Línea {line.numero} de {researchLines.length}
          </span>
        </div>
      </PageHeader>

      <div className="container-page grid gap-12 py-14 sm:py-20 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <section aria-labelledby="descripcion-titulo">
            <h2 id="descripcion-titulo" className="font-display text-[1.5rem] font-semibold text-navy-950">
              Descripción
            </h2>
            <p className="prose-institutional mt-4">{line.descripcion}</p>

            <h3 className="mt-10 text-[1.0625rem] font-semibold text-navy-950">Ejes temáticos</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {line.ejes.map((eje) => (
                <li
                  key={eje}
                  className="rounded-full px-3.5 py-1.5 text-[0.9375rem] font-medium"
                  style={{ backgroundColor: tint(theme.color, 8), color: theme.color }}
                >
                  {eje}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="productos-titulo" className="mt-14">
            <h2 id="productos-titulo" className="font-display text-[1.5rem] font-semibold text-navy-950">
              Proyectos y productos
            </h2>
            <PendingContent className="mt-4" title="Información por publicar">
              Los proyectos, publicaciones y resultados de esta línea se mostrarán aquí cuando la red los documente.
            </PendingContent>
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-5">
          <section aria-labelledby="responsable-titulo" className="rounded-panel border border-rule bg-white p-6 shadow-card sm:p-7">
            <h2 id="responsable-titulo" className="text-sm font-semibold text-ink-subtle">
              Responsable de la línea
            </h2>
            {responsable ? (
              <div className="mt-4 flex items-center gap-4">
                <Monogram nombres={responsable.nombres} apellidos={responsable.apellidos} color={theme.color} size="lg" />
                <div>
                  <p className="text-[1.125rem] leading-snug font-semibold text-navy-950">{formatMemberName(responsable)}</p>
                  <p className="mt-1 text-[0.9375rem] text-ink-muted">
                    {getInstitutionById(responsable.institucionId)?.nombre ?? UNCONFIRMED_INSTITUTION_LABEL}
                  </p>
                </div>
              </div>
            ) : status === 'loading' ? (
              <LoadingState className="py-6" />
            ) : (
              <p className="mt-3 text-ink-muted">Por confirmar</p>
            )}
          </section>

          <section aria-labelledby="integrantes-linea-titulo" className="rounded-panel bg-mist p-6 sm:p-7">
            <h2 id="integrantes-linea-titulo" className="text-sm font-semibold text-ink-subtle">
              Integrantes en el directorio
            </h2>
            {status === 'loading' ? <LoadingState className="py-6" label="Contando integrantes…" /> : null}
            {status === 'error' ? <ErrorState className="mt-4 py-8" error={error} onRetry={retry} /> : null}
            {status === 'success' ? (
              <>
                <p className="mt-2 font-display text-[2.25rem] font-semibold text-navy-950 tabular-nums">
                  {lineMembers.length}
                </p>
                <p className="text-[0.9375rem] text-ink-muted">
                  {plural(lineMembers.length, 'persona registrada', 'personas registradas')} en esta línea
                  {lineMembers.some((m) => m.esDemostrativo) ? ', incluidos registros demostrativos' : ''}.
                </p>
                <ButtonLink
                  to={`${ROUTES.integrantes}?linea=${line.id}`}
                  variant="primary"
                  className="mt-6 w-full sm:w-auto"
                  icon={<Users className="size-4" aria-hidden="true" />}
                  iconPosition="start"
                >
                  Ver integrantes de esta línea
                </ButtonLink>
              </>
            ) : null}
          </section>
        </aside>
      </div>

      <nav aria-label="Otras líneas de investigación" className="border-t border-rule">
        <div className="container-page grid gap-4 py-8 sm:grid-cols-2">
          {previous ? (
            <Link
              to={researchLinePath(previous.slug)}
              className="group flex items-center gap-3 rounded-card p-3 hover:bg-mist"
            >
              <ArrowLeft className="size-5 shrink-0 text-ink-subtle group-hover:text-electric-600" aria-hidden="true" />
              <span>
                <span className="block text-sm text-ink-subtle">Línea anterior</span>
                <span className="font-semibold text-navy-950">{previous.nombreCorto}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={researchLinePath(next.slug)}
              className="group flex items-center justify-end gap-3 rounded-card p-3 text-right hover:bg-mist"
            >
              <span>
                <span className="block text-sm text-ink-subtle">Línea siguiente</span>
                <span className="font-semibold text-navy-950">{next.nombreCorto}</span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-ink-subtle group-hover:text-electric-600" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </nav>
    </>
  );
}
