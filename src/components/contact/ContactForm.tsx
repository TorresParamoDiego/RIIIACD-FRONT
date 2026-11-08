import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, CircleCheck, LoaderCircle, Mail, Send } from 'lucide-react';
import { Button, ButtonAnchor } from '@/components/common/Button';
import { siteConfig } from '@/config/site';
import { cn } from '@/utils/cn';

interface ContactValues {
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
}

type ContactField = keyof ContactValues;
type ContactErrors = Partial<Record<ContactField, string>>;
type SubmitStatus = 'idle' | 'preparing' | 'prepared';

const EMPTY: ContactValues = { nombre: '', correo: '', asunto: '', mensaje: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MESSAGE_MIN = 20;
const MESSAGE_MAX = 2000;

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (values.nombre.trim().length < 3) errors.nombre = 'Escribe tu nombre completo (al menos 3 caracteres).';
  if (!values.correo.trim()) errors.correo = 'Escribe tu correo electrónico.';
  else if (!EMAIL_PATTERN.test(values.correo.trim())) errors.correo = 'El correo no tiene un formato válido, p. ej. nombre@institucion.mx.';
  if (values.asunto.trim().length < 4) errors.asunto = 'Indica el asunto de tu mensaje (al menos 4 caracteres).';
  if (values.mensaje.trim().length < MESSAGE_MIN) errors.mensaje = `El mensaje debe tener al menos ${MESSAGE_MIN} caracteres.`;
  else if (values.mensaje.length > MESSAGE_MAX) errors.mensaje = `El mensaje no puede superar ${MESSAGE_MAX} caracteres.`;
  return errors;
}

function buildMailto(values: ContactValues): string {
  const body = `${values.mensaje.trim()}\n\n—\n${values.nombre.trim()}\n${values.correo.trim()}`;
  return `mailto:${siteConfig.correoContacto}?subject=${encodeURIComponent(values.asunto.trim())}&body=${encodeURIComponent(body)}`;
}

/**
 * Formulario de contacto (fase 1).
 * No envía datos a ningún servidor: valida, simula la preparación y ofrece
 * abrir el mensaje en la aplicación de correo del usuario. Al integrar el
 * backend, sustituir `prepare` por la llamada a la API (p. ej. POST /contact).
 */
export function ContactForm() {
  const formId = useId();
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors = validateContact(values);
  const errorCount = Object.keys(errors).length;
  const showError = (field: ContactField): string | undefined =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const update = (field: ContactField, value: string): void => setValues((prev) => ({ ...prev, [field]: value }));
  const touch = (field: ContactField): void => setTouched((prev) => ({ ...prev, [field]: true }));

  const prepare = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (errorCount > 0) {
      const firstInvalid = (['nombre', 'correo', 'asunto', 'mensaje'] as const).find((f) => errors[f]);
      if (firstInvalid) document.getElementById(`${formId}-${firstInvalid}`)?.focus();
      return;
    }
    setStatus('preparing');
    window.setTimeout(() => setStatus('prepared'), 700);
  };

  const reset = (): void => {
    setValues(EMPTY);
    setTouched({});
    setSubmitAttempted(false);
    setStatus('idle');
  };

  const fieldProps = (field: ContactField) => {
    const error = showError(field);
    return {
      id: `${formId}-${field}`,
      name: field,
      value: values[field],
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `${formId}-${field}-error` : undefined,
      onBlur: () => touch(field),
      className: 'field-control',
    };
  };

  return (
    <div className="rounded-panel border border-rule bg-white p-6 shadow-card sm:p-9">
      <AnimatePresence mode="wait" initial={false}>
        {status === 'prepared' ? (
          <motion.div
            key="prepared"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="status"
            aria-live="polite"
          >
            <span className="grid size-12 place-items-center rounded-full bg-success-50 text-success">
              <CircleCheck className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-[1.5rem] leading-tight font-semibold text-navy-950">Tu mensaje está listo</h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              Este portal todavía no envía mensajes desde el sitio, así que <strong className="font-semibold text-navy-950">aún no se ha enviado</strong>.
              Ábrelo en tu aplicación de correo para enviarlo a {siteConfig.correoContacto}; el asunto y el texto ya están
              escritos.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonAnchor
                href={buildMailto(values)}
                variant="primary"
                icon={<Mail className="size-4" aria-hidden="true" />}
                iconPosition="start"
              >
                Abrir en mi correo
              </ButtonAnchor>
              <Button variant="secondary" onClick={reset}>
                Escribir otro mensaje
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={prepare}
            aria-labelledby={`${formId}-title`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 id={`${formId}-title`} className="font-display text-[1.5rem] leading-tight font-semibold text-navy-950">
              Escríbenos
            </h2>
            <p className="mt-2 text-[0.9375rem] text-ink-muted">Todos los campos son obligatorios.</p>

            {submitAttempted && errorCount > 0 ? (
              <div role="alert" className="mt-6 flex gap-2.5 rounded-control border border-danger/25 bg-danger-50 px-4 py-3 text-[0.9375rem] text-danger">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {errorCount === 1 ? 'Revisa el campo marcado.' : `Revisa los ${errorCount} campos marcados.`}
              </div>
            ) : null}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Nombre" htmlFor={`${formId}-nombre`} error={showError('nombre')} errorId={`${formId}-nombre-error`}>
                <input type="text" autoComplete="name" {...fieldProps('nombre')} onChange={(e) => update('nombre', e.target.value)} />
              </Field>
              <Field label="Correo electrónico" htmlFor={`${formId}-correo`} error={showError('correo')} errorId={`${formId}-correo-error`}>
                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  {...fieldProps('correo')}
                  onChange={(e) => update('correo', e.target.value)}
                />
              </Field>
              <Field
                label="Asunto"
                htmlFor={`${formId}-asunto`}
                error={showError('asunto')}
                errorId={`${formId}-asunto-error`}
                className="sm:col-span-2"
              >
                <input type="text" {...fieldProps('asunto')} onChange={(e) => update('asunto', e.target.value)} />
              </Field>
              <Field
                label="Mensaje"
                htmlFor={`${formId}-mensaje`}
                error={showError('mensaje')}
                errorId={`${formId}-mensaje-error`}
                className="sm:col-span-2"
                hint={
                  <span className={cn('tabular-nums', values.mensaje.length > MESSAGE_MAX && 'text-danger')}>
                    {values.mensaje.length}/{MESSAGE_MAX}
                  </span>
                }
              >
                <textarea rows={6} {...fieldProps('mensaje')} className="field-control resize-y" onChange={(e) => update('mensaje', e.target.value)} />
              </Field>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-subtle">
                Por ahora el formulario prepara el mensaje para tu aplicación de correo; no se guarda ni se envía desde el sitio.
              </p>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={status === 'preparing'}
                icon={
                  status === 'preparing' ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="size-4" aria-hidden="true" />
                  )
                }
              >
                {status === 'preparing' ? 'Preparando…' : 'Preparar mensaje'}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  errorId: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

function Field({ label, htmlFor, error, errorId, hint, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-navy-950">
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
