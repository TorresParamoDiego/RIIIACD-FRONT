import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LoadingStateProps {
  label?: string;
  /** Muestra tarjetas esqueleto en lugar del indicador circular. */
  skeletonCount?: number;
  className?: string;
}

export function LoadingState({ label = 'Cargando información…', skeletonCount, className }: LoadingStateProps) {
  if (skeletonCount) {
    return (
      <div role="status" aria-live="polite" className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
        <span className="sr-only">{label}</span>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <div key={i} className="rounded-card border border-rule bg-white p-5" aria-hidden="true">
            <div className="flex items-center gap-3">
              <div className="size-12 animate-pulse rounded-full bg-mist" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-mist" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-mist" />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-mist" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-mist" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className={cn('flex items-center justify-center gap-3 py-16 text-ink-muted', className)}>
      <LoaderCircle className="size-5 animate-spin text-electric-600" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
