import { PageHeader } from '@/components/common/PageHeader';
import { Reveal } from '@/components/common/Reveal';
import { ResearchCard } from '@/components/research/ResearchCard';
import { getDocumentedMemberById } from '@/data/members';
import { researchLines } from '@/data/researchLines';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function ResearchLines() {
  useDocumentTitle('Líneas de investigación');

  return (
    <>
      <PageHeader
        title="Líneas de investigación"
        breadcrumbs={[{ label: 'Líneas de investigación' }]}
        description="La red organiza su trabajo en cinco líneas oficiales. Cada una cuenta con una persona responsable y reúne a integrantes de distintas instituciones."
      />

      <section aria-label="Listado de líneas de investigación" className="bg-mist py-14 sm:py-20">
        <ol className="container-page flex flex-col gap-6">
          {researchLines.map((line, index) => (
            <li key={line.id}>
              <Reveal delay={Math.min(index, 2) * 0.05}>
                <ResearchCard line={line} responsable={getDocumentedMemberById(line.responsableId)} variant="full" />
              </Reveal>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
