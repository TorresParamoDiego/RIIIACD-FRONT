import { Link } from 'react-router-dom';
import { Leadership } from '@/components/home/Leadership';
import { Objective } from '@/components/home/Objective';
import { Statistics } from '@/components/home/Statistics';
import { PendingContent } from '@/components/common/Notice';
import { PageHeader } from '@/components/common/PageHeader';
import { Reveal } from '@/components/common/Reveal';
import { SectionTitle } from '@/components/common/SectionTitle';
import { researchLinePath, siteConfig } from '@/config/site';
import { contextoOrigen, importanciaColaboracion, quienesSomos } from '@/data/content';
import { getDocumentedMemberById } from '@/data/members';
import { researchLines } from '@/data/researchLines';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { lineThemes } from '@/theme/lineThemes';
import { formatMemberName } from '@/utils/members';

/** Organigrama: liderazgo de la red → cinco líneas con su responsable. */
function OrganizationChart() {
  const leader = getDocumentedMemberById(siteConfig.liderRedId);
  return (
    <div className="rounded-panel border border-rule bg-white p-6 sm:p-8">
      <div className="mx-auto max-w-sm rounded-card bg-brand-blue px-5 py-4 text-center text-white">
        <p className="text-sm text-white/65">Liderazgo de la red</p>
        <p className="mt-1 font-semibold">{leader ? formatMemberName(leader) : 'Por confirmar'}</p>
      </div>

      <div className="mx-auto h-6 w-px bg-rule-strong" aria-hidden="true" />
      <div className="mx-auto hidden h-px w-[80%] bg-rule-strong lg:block" aria-hidden="true" />

      <ol className="mt-0 grid gap-3 lg:mt-0 lg:grid-cols-5">
        {researchLines.map((line) => {
          const responsable = getDocumentedMemberById(line.responsableId);
          const theme = lineThemes[line.id];
          return (
            <li key={line.id} className="relative flex flex-col lg:pt-6">
              <span className="absolute top-0 left-1/2 hidden h-6 w-px bg-rule-strong lg:block" aria-hidden="true" />
              <Link
                to={researchLinePath(line.slug)}
                className="flex h-full flex-col rounded-card border border-rule p-4 transition-colors hover:border-rule-strong hover:bg-mist"
                style={{ borderTopColor: theme.color, borderTopWidth: 3 }}
              >
                <span className="text-sm font-semibold" style={{ color: theme.color }}>
                  Línea {line.numero}
                </span>
                <span className="mt-1 text-[0.9375rem] leading-snug font-medium text-ink">{line.nombreCorto}</span>
                <span className="mt-auto pt-3 text-sm text-ink-muted">{responsable ? formatMemberName(responsable) : 'Por confirmar'}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function About() {
  useDocumentTitle('Nosotros');

  return (
    <>
      <PageHeader title="Nosotros" breadcrumbs={[{ label: 'Nosotros' }]} description={`${siteConfig.nombre} (${siteConfig.siglas}).`} />

      <section aria-labelledby="quienes-titulo" className="py-16 sm:py-24">
        <Reveal className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
          <h2 id="quienes-titulo" className="font-display text-[2rem] leading-[1.1] font-semibold text-ink sm:text-[2.5rem] lg:col-span-4">
            {quienesSomos.titulo}
          </h2>
          <div className="prose-institutional lg:col-span-8">
            {quienesSomos.parrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="contexto-titulo" className="border-t border-rule py-16 sm:py-24">
        <Reveal className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
          <h2 id="contexto-titulo" className="font-display text-[2rem] leading-[1.1] font-semibold text-ink sm:text-[2.5rem] lg:col-span-4">
            {contextoOrigen.titulo}
          </h2>
          <div className="lg:col-span-8">
            <div className="prose-institutional">
              {contextoOrigen.parrafos.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <PendingContent className="mt-6 max-w-[68ch]" title="Antecedentes por publicar">
              {contextoOrigen.pendiente}
            </PendingContent>
          </div>
        </Reveal>
      </section>

      <div className="bg-mist">
        <Objective />
      </div>

      <section aria-labelledby="organizacion-titulo" className="py-16 sm:py-24">
        <div className="container-page">
          <Reveal>
            <SectionTitle
              id="organizacion-titulo"
              title="Organización"
              description="La red se organiza en un liderazgo general y cinco líneas de investigación, cada una con una persona responsable. Participan institutos tecnológicos, centros de investigación y universidades."
            />
          </Reveal>
          <Reveal className="mt-10">
            <OrganizationChart />
          </Reveal>
          <Statistics variant="plain" className="mt-6" />
        </div>
      </section>

      <Leadership className="border-t border-rule bg-mist/50" />

      <section aria-labelledby="colaboracion-cientifica-titulo" className="py-16 sm:py-24">
        <Reveal className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
          <h2
            id="colaboracion-cientifica-titulo"
            className="font-display text-[2rem] leading-[1.1] font-semibold text-ink sm:text-[2.5rem] lg:col-span-4"
          >
            {importanciaColaboracion.titulo}
          </h2>
          <div className="prose-institutional lg:col-span-8">
            {importanciaColaboracion.parrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}
