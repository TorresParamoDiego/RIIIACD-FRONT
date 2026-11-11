import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { Reveal } from '@/components/common/Reveal';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ResearchCard } from '@/components/research/ResearchCard';
import { ROUTES } from '@/config/site';
import { getDocumentedMemberById } from '@/data/members';
import { researchLines } from '@/data/researchLines';
import { cn } from '@/utils/cn';

export function ResearchPreview() {
  return (
    <section aria-labelledby="lineas-titulo" className="bg-mist py-20 sm:py-28">
      <div className="container-page">
        <Reveal>
          <SectionTitle
            id="lineas-titulo"
            title="Cinco líneas de investigación"
            description="Cada línea reúne a integrantes de distintas instituciones en torno a un campo de la inteligencia artificial y la ciencia de datos, bajo la coordinación de una persona responsable."
            action={
              <ButtonLink to={ROUTES.lineas} variant="secondary" icon={<ArrowRight className="size-4" aria-hidden="true" />}>
                Ver todas las líneas
              </ButtonLink>
            }
          />
        </Reveal>

        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {researchLines.map((line, index) => (
            <li key={line.id} className={cn('lg:col-span-2', index >= 3 && 'lg:col-span-3')}>
              <Reveal className="h-full" delay={index * 0.05}>
                <ResearchCard line={line} responsable={getDocumentedMemberById(line.responsableId)} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
