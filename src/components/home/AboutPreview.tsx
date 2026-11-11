import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { Reveal } from '@/components/common/Reveal';
import { ROUTES } from '@/config/site';
import { presentacion } from '@/data/content';

export function AboutPreview() {
  return (
    <section aria-labelledby="presentacion-titulo" className="py-20 sm:py-28">
      <Reveal className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
        <h2
          id="presentacion-titulo"
          className="font-display text-[2rem] leading-[1.1] font-semibold text-ink text-balance sm:text-[2.75rem] lg:col-span-5"
        >
          {presentacion.titulo}
        </h2>
        <div className="lg:col-span-7 lg:pt-2">
          <div className="prose-institutional">
            {presentacion.parrafos.map((parrafo) => (
              <p key={parrafo}>{parrafo}</p>
            ))}
          </div>
          <ButtonLink
            to={ROUTES.nosotros}
            variant="quiet"
            className="mt-6 -ml-2.5"
            icon={<ArrowRight className="size-4" aria-hidden="true" />}
          >
            Más sobre la red
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
