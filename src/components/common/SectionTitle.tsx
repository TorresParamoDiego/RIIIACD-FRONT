import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionTitleProps {
  title: string;
  description?: ReactNode;
  /** id del encabezado, para enlazarlo con aria-labelledby de la sección. */
  id?: string;
  as?: 'h1' | 'h2' | 'h3';
  tone?: 'light' | 'dark';
  align?: 'start' | 'center';
  action?: ReactNode;
  className?: string;
}

export function SectionTitle({
  title,
  description,
  id,
  as: Heading = 'h2',
  tone = 'light',
  align = 'start',
  action,
  className,
}: SectionTitleProps) {
  const dark = tone === 'dark';
  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'items-center text-center md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        <Heading
          id={id}
          className={cn(
            'font-display text-[1.875rem] leading-[1.12] font-semibold text-balance sm:text-[2.375rem]',
            dark ? 'text-white' : 'text-ink',
          )}
        >
          {title}
        </Heading>
        {description ? (
          <div className={cn('mt-4 text-[1.0625rem] leading-relaxed text-pretty', dark ? 'text-white/75' : 'text-ink-muted')}>
            {description}
          </div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
