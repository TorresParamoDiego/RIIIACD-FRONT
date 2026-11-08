import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail } from 'lucide-react';
import { LogoMark } from '@/components/common/Logo';
import { mainNavigation, researchLinePath, siteConfig } from '@/config/site';
import { researchLines } from '@/data/researchLines';

export function Footer() {
  const year = new Date().getFullYear();
  const { institucionMatriz } = siteConfig;

  return (
    <footer className="on-dark bg-navy-950 text-white">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <LogoMark className="size-11" tone="dark" />
            <span className="font-display text-2xl font-bold tracking-tight">{siteConfig.siglas}</span>
          </div>
          <p className="mt-5 max-w-sm text-[1.0625rem] leading-snug font-medium text-white/90">{siteConfig.nombre}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            Red de investigación del entorno del {institucionMatriz.nombre} ({institucionMatriz.siglas}).
          </p>
          <a
            href={`mailto:${siteConfig.correoContacto}`}
            className="mt-6 inline-flex items-center gap-2 rounded-md text-[0.9375rem] text-signal hover:text-white"
          >
            <Mail className="size-4" aria-hidden="true" />
            {siteConfig.correoContacto}
          </a>
        </div>

        <nav aria-label="Navegación secundaria" className="md:col-span-3">
          <h2 className="text-sm font-semibold text-white/50">Sitio</h2>
          <ul className="mt-4 space-y-2.5">
            {mainNavigation.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="rounded text-[0.9375rem] text-white/80 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Líneas de investigación" className="md:col-span-4">
          <h2 className="text-sm font-semibold text-white/50">Líneas de investigación</h2>
          <ul className="mt-4 space-y-2.5">
            {researchLines.map((line) => (
              <li key={line.id}>
                <Link
                  to={researchLinePath(line.slug)}
                  className="rounded text-[0.9375rem] text-white/80 hover:text-white"
                >
                  {line.nombreCorto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.siglas}. Todos los derechos reservados.
          </p>
          <a
            href={institucionMatriz.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded hover:text-white"
          >
            {institucionMatriz.nombre}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(abre en una pestaña nueva)</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
