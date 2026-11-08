import type { ReactNode } from 'react';
import { CircleAlert, SearchX, type LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

interface StatusMessageProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: 'neutral' | 'danger';
  className?: string;
}

function StatusMessage({ icon: Icon, title, description, action, tone = 'neutral', className }: StatusMessageProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-panel border border-dashed px-6 py-14 text-center',
        tone === 'danger' ? 'border-danger/30 bg-danger-50' : 'border-rule-strong bg-mist/60',
        className,
      )}
    >
      <span
        className={cn(
          'grid size-12 place-items-center rounded-full',
          tone === 'danger' ? 'bg-white text-danger' : 'bg-white text-navy-800',
        )}
      >
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-navy-950">{title}</h3>
      {description ? <div className="mt-2 max-w-md text-ink-muted">{description}</div> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: ReactNode;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
}

export function EmptyState({
  title = 'No hay resultados con estos filtros',
  description = 'Prueba con otro nombre o quita alguno de los filtros aplicados.',
  onReset,
  resetLabel = 'Quitar filtros',
  className,
}: EmptyStateProps) {
  return (
    <StatusMessage
      icon={SearchX}
      title={title}
      description={description}
      className={className}
      action={
        onReset ? (
          <Button variant="secondary" onClick={onReset}>
            {resetLabel}
          </Button>
        ) : null
      }
    />
  );
}

interface ErrorStateProps {
  title?: string;
  error?: Error;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = 'No se pudo cargar la información', error, onRetry, className }: ErrorStateProps) {
  return (
    <div role="alert">
      <StatusMessage
        icon={CircleAlert}
        tone="danger"
        title={title}
        className={className}
        description={
          <>
            {error?.message ? <p>{error.message}</p> : null}
            <p className="mt-1">Revisa tu conexión e inténtalo de nuevo.</p>
          </>
        }
        action={
          onRetry ? (
            <Button variant="secondary" onClick={onRetry}>
              Reintentar
            </Button>
          ) : null
        }
      />
    </div>
  );
}
