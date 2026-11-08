import { Reveal } from '@/components/common/Reveal';
import { objetivoGeneral } from '@/data/content';

interface ObjectiveProps {
  headingLevel?: 'h2' | 'h3';
}

/** Objetivo institucional destacado. El texto proviene de src/data/content.ts. */
export function Objective({ headingLevel: Heading = 'h2' }: ObjectiveProps) {
  return (
    <section aria-labelledby="objetivo-titulo" className="py-20 sm:py-28">
      <div className="container-page">
        <Reveal className="on-dark relative overflow-hidden rounded-panel bg-navy-800 px-6 py-14 text-white sm:px-14 sm:py-20">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -right-10 h-72 w-72 text-white/10 sm:h-96 sm:w-96"
            viewBox="0 0 200 200"
            fill="none"
          >
            <g stroke="currentColor" strokeWidth="1">
              <path d="M100 20 L176 75 L147 165 L53 165 L24 75 Z" />
              <path d="M100 20 L147 165 L24 75 L176 75 L53 165 Z" />
            </g>
            <g fill="currentColor">
              <circle cx="100" cy="20" r="5" />
              <circle cx="176" cy="75" r="5" />
              <circle cx="147" cy="165" r="5" />
              <circle cx="53" cy="165" r="5" />
              <circle cx="24" cy="75" r="5" />
            </g>
          </svg>

          <Heading id="objetivo-titulo" className="relative text-[1.0625rem] font-semibold text-signal">
            Objetivo general
          </Heading>
          <blockquote className="relative mt-6 max-w-4xl">
            <p className="font-display text-[1.5rem] leading-[1.3] font-medium text-balance sm:text-[2.125rem]">
              {objetivoGeneral}
            </p>
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}
