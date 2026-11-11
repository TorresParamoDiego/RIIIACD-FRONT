import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/text';

interface MonogramProps {
  nombres: string;
  apellidos: string;
  /** Color de acento (p. ej. el de la línea de investigación). */
  color?: string;
  fotoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'size-10 text-sm',
  md: 'size-12 text-base',
  lg: 'size-16 text-xl',
  xl: 'size-28 text-4xl',
} as const;

/**
 * Avatar del integrante. Muestra la fotografía cuando exista (`fotoUrl`) y,
 * mientras tanto, las iniciales. No se generan imágenes de personas.
 */
export function Monogram({ nombres, apellidos, color = '#1B396A', fotoUrl, size = 'md', className }: MonogramProps) {
  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt=""
        className={cn('shrink-0 rounded-full object-cover ring-1 ring-rule', sizes[size], className)}
        loading="lazy"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn('grid shrink-0 place-items-center rounded-full font-display font-semibold', sizes[size], className)}
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 9%, white)`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 22%, white)`,
      }}
    >
      {getInitials(nombres, apellidos)}
    </span>
  );
}
