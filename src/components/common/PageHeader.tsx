import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '@/config/site';

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  children?: ReactNode;
}

/** Encabezado de páginas internas: banda azul marino con migas de pan. */
export function PageHeader({ title, description, breadcrumbs = [], children }: PageHeaderProps) {
  const trail: Crumb[] = [{ label: 'Inicio', to: ROUTES.inicio }, ...breadcrumbs];

  return (
    <header className="on-dark relative overflow-hidden bg-navy-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.09) 1px, transparent 0)',
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(100deg, transparent 35%, black 85%)',
        }}
      />
      <div className="container-page relative pt-28 pb-14 sm:pt-32 sm:pb-16">
        <nav aria-label="Ruta de navegación">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-white/60">
            {trail.map((crumb, index) => {
              const last = index === trail.length - 1;
              return (
                <li key={crumb.label} className="flex items-center gap-1">
                  {crumb.to && !last ? (
                    <Link to={crumb.to} className="rounded hover:text-white">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current={last ? 'page' : undefined} className={last ? 'text-white/85' : undefined}>
                      {crumb.label}
                    </span>
                  )}
                  {!last ? <ChevronRight className="size-3.5 text-white/40" aria-hidden="true" /> : null}
                </li>
              );
            })}
          </ol>
        </nav>
        <h1 className="mt-5 max-w-4xl font-display text-[2.25rem] leading-[1.08] font-semibold text-balance sm:text-[3rem]">
          {title}
        </h1>
        {description ? (
          <div className="mt-5 max-w-[62ch] text-[1.0625rem] leading-relaxed text-white/75 text-pretty sm:text-lg">
            {description}
          </div>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </header>
  );
}
