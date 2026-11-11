import { siteConfig } from '@/config/site';
import { cn } from '@/utils/cn';

interface LogoMarkProps {
  className?: string;
  tone?: 'light' | 'dark';
}

/**
 * Símbolo de RIIIACD: cinco nodos (las cinco líneas) unidos en una sola red.
 * Símbolo PROVISIONAL: se sustituirá por los logotipos oficiales del TecNM y del
 * Tecnológico de Celaya (SVG o PNG) cuando se reciban (pendiente 4.3 del brief).
 */
export function LogoMark({ className, tone = 'light' }: LogoMarkProps) {
  const node = tone === 'dark' ? '#FFFFFF' : '#071B35';
  // Trazos: acento claro sobre azul; verde de marca sobre fondo claro.
  const stroke = tone === 'dark' ? '#A7F3D0' : '#117533';
  return (
    <svg viewBox="0 0 40 40" className={cn('shrink-0', className)} aria-hidden="true" focusable="false">
      <g stroke={stroke} strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 6 L33 15.5 L28.5 31 L11.5 31 L7 15.5 Z" fill="none" opacity="0.9" />
        <path d="M20 6 L28.5 31 M7 15.5 L33 15.5" opacity="0.55" />
      </g>
      <g fill={node}>
        <circle cx="20" cy="6" r="3.6" />
        <circle cx="33" cy="15.5" r="3" />
        <circle cx="28.5" cy="31" r="3" />
        <circle cx="11.5" cy="31" r="3" />
        <circle cx="7" cy="15.5" r="3" />
      </g>
    </svg>
  );
}

interface LogoProps {
  tone?: 'light' | 'dark';
  showDescriptor?: boolean;
  className?: string;
}

export function Logo({ tone = 'light', showDescriptor = true, className }: LogoProps) {
  const dark = tone === 'dark';
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className="size-9" tone={tone} />
      <span className="flex flex-col leading-none">
        <span className={cn('font-display text-[1.1875rem] font-bold tracking-tight', dark ? 'text-white' : 'text-ink')}>
          {siteConfig.siglas}
        </span>
        {showDescriptor ? (
          <span className={cn('mt-1 hidden text-[0.6875rem] font-medium sm:block', dark ? 'text-white/65' : 'text-ink-subtle')}>
            Investigación e innovación en IA
          </span>
        ) : null}
      </span>
    </span>
  );
}
