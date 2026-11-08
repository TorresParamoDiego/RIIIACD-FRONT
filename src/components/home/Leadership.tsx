import { Link } from 'react-router-dom';
import { Building2, Mail } from 'lucide-react';
import { ButtonAnchor } from '@/components/common/Button';
import { Monogram } from '@/components/common/Monogram';
import { Reveal } from '@/components/common/Reveal';
import { SectionTitle } from '@/components/common/SectionTitle';
import { researchLinePath, siteConfig } from '@/config/site';
import { getInstitutionById } from '@/data/institutions';
import { getDocumentedMemberById } from '@/data/members';
import { getResearchLineById, researchLines } from '@/data/researchLines';
import { lineThemes } from '@/theme/lineThemes';
import { cn } from '@/utils/cn';
import { formatMemberName } from '@/utils/members';

interface LeadershipProps {
  title?: string;
  description?: string;
  /** Espaciado vertical de la sección; la portada lo reduce porque le precede otra sección con margen. */
  spacing?: string;
  className?: string;
}

/**
 * Liderazgo de la red y responsables de línea. Sin fotografías ni datos
 * biográficos: solo nombre, rol y adscripción documentados.
 */
export function Leadership({
  title = 'Liderazgo',
  description = 'La red cuenta con un liderazgo general y una persona responsable para cada línea de investigación.',
  spacing = 'py-20 sm:py-28',
  className,
}: LeadershipProps) {
  const leader = getDocumentedMemberById(siteConfig.liderRedId);
  if (!leader) return null;

  const leaderLine = getResearchLineById(leader.lineaInvestigacionId);
  const leaderInstitution = getInstitutionById(leader.institucionId);

  return (
    <section aria-labelledby="liderazgo-titulo" className={cn(spacing, className)}>
      <div className="container-page">
        <Reveal>
          <SectionTitle id="liderazgo-titulo" title={title} description={description} />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <article className="flex h-full flex-col rounded-panel border border-rule bg-white p-7 shadow-card sm:p-9">
              <Monogram nombres={leader.nombres} apellidos={leader.apellidos} size="xl" color="#123C68" />
              <p className="mt-7 text-[0.9375rem] font-semibold text-electric-700">{leader.rol}</p>
              <h3 className="mt-1.5 font-display text-[1.625rem] leading-tight font-semibold text-navy-950 text-balance">
                {formatMemberName(leader)}
              </h3>
              {leaderLine ? (
                <p className="mt-3 text-ink-muted">
                  Responsable de la{' '}
                  <Link to={researchLinePath(leaderLine.slug)} className="font-medium text-navy-950 underline decoration-rule-strong underline-offset-4 hover:decoration-electric-600">
                    línea {leaderLine.numero}: {leaderLine.nombre}
                  </Link>
                </p>
              ) : null}
              {leaderInstitution ? (
                <p className="mt-4 flex items-start gap-2 text-[0.9375rem] text-ink-muted">
                  <Building2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {leaderInstitution.nombre} ({leaderInstitution.siglas})
                </p>
              ) : null}
              {leader.correoPublico ? (
                <div className="mt-auto pt-8">
                  <ButtonAnchor
                    href={`mailto:${leader.correoPublico}`}
                    variant="secondary"
                    icon={<Mail className="size-4" aria-hidden="true" />}
                    iconPosition="start"
                  >
                    {leader.correoPublico}
                  </ButtonAnchor>
                </div>
              ) : null}
            </article>
          </Reveal>

          <Reveal className="lg:col-span-7" delay={0.08}>
            <div className="h-full rounded-panel border border-rule bg-mist/60 p-7 sm:p-9">
              <h3 className="text-[1.0625rem] font-semibold text-navy-950">Responsables de línea</h3>
              <ol className="mt-5 divide-y divide-rule">
                {researchLines.map((line) => {
                  const responsable = getDocumentedMemberById(line.responsableId);
                  const theme = lineThemes[line.id];
                  return (
                    <li key={line.id} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 py-4 first:pt-0 last:pb-0">
                      <span
                        className="font-display text-[1.25rem] leading-7 font-semibold tabular-nums"
                        style={{ color: theme.color }}
                        aria-hidden="true"
                      >
                        {line.numero}
                      </span>
                      <div>
                        <p className="font-semibold text-navy-950">
                          {responsable ? formatMemberName(responsable) : 'Por confirmar'}
                        </p>
                        <Link
                          to={researchLinePath(line.slug)}
                          className="mt-0.5 inline-block rounded text-[0.9375rem] leading-snug text-ink-muted hover:text-electric-700"
                        >
                          <span className="sr-only">Línea {line.numero}: </span>
                          {line.nombre}
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
