import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { ROUTES, siteConfig } from '@/config/site';
import { networkStatistics } from '@/data/statistics';
import { researchLines } from '@/data/researchLines';
import { NetworkGraph } from './NetworkGraph';

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="on-dark relative overflow-hidden bg-navy-950 text-white">
      {/* Un único degradado discreto, del azul institucional hacia el marino */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 80% at 85% 40%, rgb(18 60 104 / 0.95) 0%, rgb(7 27 53 / 0) 70%)',
        }}
      />

      <div className="container-page relative grid items-center gap-10 pt-28 pb-24 sm:pt-32 lg:grid-cols-12 lg:gap-8 lg:pt-36 lg:pb-32">
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="flex items-center gap-3 text-[0.9375rem] font-medium text-white/70">
            <span className="h-px w-8 bg-signal" aria-hidden="true" />
            {siteConfig.institucionMatriz.nombre}
          </p>

          <h1
            id="hero-title"
            className="mt-6 font-display text-[2.25rem] leading-[1.06] font-semibold text-balance sm:text-[3rem] xl:text-[3.5rem]"
          >
            {siteConfig.nombre}
          </h1>

          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-white/75 text-pretty sm:text-xl">
            {siteConfig.lema}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to={ROUTES.nosotros} variant="onDark" size="lg">
              Conoce nuestra red
            </ButtonLink>
            <ButtonLink
              to={ROUTES.lineas}
              variant="onDarkOutline"
              size="lg"
              icon={<ArrowRight className="size-4" aria-hidden="true" />}
            >
              Explora las líneas de investigación
            </ButtonLink>
          </div>
        </motion.div>

        <figure className="relative mx-auto w-full max-w-[30rem] sm:max-w-[34rem] lg:col-span-5 lg:max-w-none">
          <NetworkGraph nodeCount={networkStatistics.integrantes} />
          <figcaption className="mt-2 text-center text-sm text-white/55">
            {networkStatistics.integrantes} integrantes y {researchLines.length} líneas de investigación en una sola red
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
