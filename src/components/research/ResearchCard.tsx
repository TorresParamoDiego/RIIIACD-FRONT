import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import { ROUTES, researchLinePath } from '@/config/site';
import { lineThemes, tint } from '@/theme/lineThemes';
import type { PublicMember } from '@/types/member';
import type { ResearchLine } from '@/types/research';
import { cn } from '@/utils/cn';
import { formatMemberName } from '@/utils/members';

interface ResearchCardProps {
  line: ResearchLine;
  responsable?: PublicMember;
  variant?: 'compact' | 'full';
  className?: string;
}

export function ResearchCard({ line, responsable, variant = 'compact', className }: ResearchCardProps) {
  const theme = lineThemes[line.id];
  const Icon = theme.icon;
  const detailPath = researchLinePath(line.slug);
  const headingId = `linea-${line.numero}-titulo`;

  if (variant === 'full') {
    return (
      <article
        aria-labelledby={headingId}
        className={cn(
          'grid gap-6 rounded-panel border border-rule bg-white p-6 shadow-card sm:p-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-8',
          className,
        )}
      >
        <div className="flex items-center gap-4 md:flex-col md:items-start">
          <span
            className="grid size-14 place-items-center rounded-card"
            style={{ backgroundColor: tint(theme.color, 10), color: theme.color }}
          >
            <Icon className="size-7" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold" style={{ color: theme.color }}>
            Línea {line.numero}
          </span>
        </div>

        <div>
          <h2 id={headingId} className="font-display text-[1.5rem] leading-snug font-semibold text-ink text-balance">
            {line.nombre}
          </h2>
          <p className="mt-3 max-w-[70ch] leading-relaxed text-ink-muted">{line.descripcion}</p>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Ejes temáticos">
            {line.ejes.map((eje) => (
              <li key={eje} className="rounded-full border border-rule bg-mist px-3 py-1 text-sm text-brand-blue">
                {eje}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-5 border-t border-rule pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.9375rem] text-ink-muted">
              Responsable: <span className="font-semibold text-ink">{responsable ? formatMemberName(responsable) : 'Por confirmar'}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`${ROUTES.integrantes}?linea=${line.id}`}
                className="inline-flex h-10 items-center gap-2 rounded-control border border-rule-strong px-3.5 text-[0.9375rem] font-medium text-ink hover:border-brand-blue hover:bg-mist"
              >
                <Users className="size-4" aria-hidden="true" />
                Integrantes
              </Link>
              <Link
                to={detailPath}
                className="inline-flex h-10 items-center gap-2 rounded-control bg-brand-blue px-3.5 text-[0.9375rem] font-semibold text-white hover:bg-brand-blue-deep"
              >
                Ver la línea
                <ArrowRight className="size-4" aria-hidden="true" />
                <span className="sr-only">{line.nombreCorto}</span>
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        'group relative flex h-full flex-col rounded-card border border-rule bg-white p-6 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-rule-strong hover:shadow-card',
        className,
      )}
    >
      <span className="absolute inset-x-6 top-0 h-[3px] rounded-b-full" style={{ backgroundColor: theme.color }} aria-hidden="true" />
      <div className="flex items-center justify-between">
        <span
          className="grid size-11 place-items-center rounded-control"
          style={{ backgroundColor: tint(theme.color, 10), color: theme.color }}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold" style={{ color: theme.color }}>
          Línea {line.numero}
        </span>
      </div>

      <h3 id={headingId} className="mt-5 text-[1.125rem] leading-snug font-semibold text-ink text-balance">
        <Link to={detailPath} className="rounded after:absolute after:inset-0 after:rounded-card">
          {line.nombre}
        </Link>
      </h3>
      <p className="mt-3 line-clamp-3 text-[0.9375rem] leading-relaxed text-ink-muted">{line.descripcion}</p>

      <p className="mt-auto flex items-end justify-between gap-3 pt-6 text-sm text-ink-muted">
        <span>
          Responsable
          <span className="mt-0.5 block font-semibold text-ink">{responsable ? formatMemberName(responsable) : 'Por confirmar'}</span>
        </span>
        <ArrowRight
          className="size-5 shrink-0 text-ink-subtle transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-brand-green"
          aria-hidden="true"
        />
      </p>
    </article>
  );
}
