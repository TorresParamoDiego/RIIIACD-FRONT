import type { ReactNode } from 'react';
import { FlaskConical, Hourglass } from 'lucide-react';
import { cn } from '@/utils/cn';

interface NoticeProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/** Aviso de que la vista incluye registros de prueba. */
export function DemoNotice({ title, children, className }: NoticeProps) {
  return (
    <aside
      className={cn(
        'flex gap-3 rounded-card border border-amber-300/70 bg-amber-50 px-4 py-3.5 text-[0.9375rem] text-amber-950',
        className,
      )}
    >
      <FlaskConical className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden="true" />
      <div>
        <p className="font-semibold">{title}</p>
        <div className="mt-0.5 text-amber-900/85">{children}</div>
      </div>
    </aside>
  );
}

/** Señala contenido institucional que aún no se ha documentado (en lugar de inventarlo). */
export function PendingContent({ title = 'Contenido en preparación', children, className }: Partial<Pick<NoticeProps, 'title'>> & Omit<NoticeProps, 'title'>) {
  return (
    <aside
      className={cn(
        'flex gap-3 rounded-card border border-dashed border-rule-strong bg-mist/70 px-4 py-3.5 text-[0.9375rem] text-ink-muted',
        className,
      )}
    >
      <Hourglass className="mt-0.5 size-5 shrink-0 text-navy-800/70" aria-hidden="true" />
      <div>
        <p className="font-semibold text-navy-950">{title}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </aside>
  );
}
