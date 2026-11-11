import type { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

/** Etiqueta, ayuda y mensaje de error de un campo de formulario. Compartido por los formularios del sitio. */
export interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  errorId: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, errorId, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
        </label>
        {hint ? <span className="text-xs text-ink-subtle">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-danger">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
