import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SelectOption } from '@/types/filters';
import { cn } from '@/utils/cn';

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

/** Select nativo con estilo institucional (accesible por teclado y en móvil). */
export function SelectField<T extends string>({ label, value, options, onChange, className }: SelectFieldProps<T>) {
  const id = useId();
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => {
            const selected = options.find((o) => o.value === event.target.value);
            if (selected) onChange(selected.value);
          }}
          className="field-control appearance-none truncate pr-10"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.count !== undefined ? `${option.label} (${option.count})` : option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
      </div>
    </div>
  );
}
