import { useCallback, useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { CircleAlert, CircleCheck, Clock, ImageUp, LinkIcon, LoaderCircle, Send, Trash2 } from 'lucide-react';
import { Button, ButtonAnchor } from '@/components/common/Button';
import { FormField } from '@/components/common/FormField';
import { LoadingState } from '@/components/common/LoadingState';
import { Monogram } from '@/components/common/Monogram';
import { PageHeader } from '@/components/common/PageHeader';
import { siteConfig } from '@/config/site';
import { researchLines } from '@/data/researchLines';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getInvitation, invitationErrorCode, submitChanges, uploadPhoto } from '@/services/memberUpdateService';
import { BIOGRAFIA_MAX_LENGTH, PERFIL_PROFESIONAL_MAX_LENGTH } from '@/types/member';
import type { InvitationErrorCode, MemberInvitation } from '@/types/memberUpdate';
import type { ResearchLineId } from '@/types/research';
import { cn } from '@/utils/cn';
import { diffProposal, hasChanges, initialValues, validatePhoto, validateProfile, type ProfileFormValues } from '@/utils/memberUpdate';

/**
 * /actualizar/:token — Formulario con el que un integrante propone cambios a
 * su perfil público. Nada se publica directamente: cada cambio entra en la
 * cola de aprobación de la coordinación (brief fase 2, 1.3).
 *
 * El backend valida el enlace (24 horas, un solo uso). Enviar el formulario
 * consume el enlace, por eso la foto se sube ANTES de enviar los cambios.
 */
export default function MemberUpdate() {
  useDocumentTitle('Actualizar perfil');
  usePrivatePageMeta();

  const { token = '' } = useParams<{ token: string }>();
  const loader = useCallback((signal: AbortSignal) => getInvitation(token, signal), [token]);
  const invitation = useAsyncResource(loader);

  return (
    <>
      <PageHeader
        title="Actualiza tu perfil"
        breadcrumbs={[{ label: 'Actualizar perfil' }]}
        description="Propón cambios a tu ficha del directorio. La coordinación de la red los revisa antes de publicarlos."
      />
      <div className="container-page py-12 sm:py-16">
        {invitation.status === 'loading' ? <LoadingState label="Verificando el enlace…" /> : null}
        {invitation.status === 'error' ? (
          <InvitationUnavailable code={invitationErrorCode(invitation.error)} onRetry={invitation.retry} />
        ) : null}
        {invitation.status === 'success' && invitation.data ? <UpdateForm token={token} invitation={invitation.data} /> : null}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------------- */

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'sending'; step: 'foto' | 'cambios' }
  | { kind: 'sent'; solicitudes: number }
  | { kind: 'error'; message: string; code: InvitationErrorCode | null };

function UpdateForm({ token, invitation }: { token: string; invitation: MemberInvitation }) {
  const formId = useId();
  const { perfil, integrante, textoConsentimiento } = invitation;
  const [values, setValues] = useState<ProfileFormValues>(() => initialValues(perfil));
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });

  const photoPreview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(
    () => () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    },
    [photoPreview],
  );

  const errors = { ...validateProfile(values), foto: validatePhoto(photo, invitation.foto) };
  const errorCount = Object.values(errors).filter(Boolean).length;
  const proposal = useMemo(() => diffProposal(perfil, values, textoConsentimiento.version), [perfil, values, textoConsentimiento.version]);
  const changed = hasChanges(proposal, photo);
  const sending = state.kind === 'sending';

  const set = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]): void =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const toggleLine = (id: ResearchLineId): void =>
    set(
      'lineasPropuestas',
      values.lineasPropuestas.includes(id) ? values.lineasPropuestas.filter((l) => l !== id) : [...values.lineasPropuestas, id],
    );

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitted(true);
    if (errorCount > 0 || !changed || sending) return;
    try {
      if (photo) {
        setState({ kind: 'sending', step: 'foto' });
        await uploadPhoto(token, photo);
      }
      setState({ kind: 'sending', step: 'cambios' });
      const result = await submitChanges(token, proposal);
      setState({ kind: 'sent', solicitudes: result.solicitudesCreadas + (photo ? 1 : 0) });
    } catch (error) {
      const code = invitationErrorCode(error);
      setState({
        kind: 'error',
        code,
        message: error instanceof Error ? error.message : 'No se pudieron enviar los cambios. Inténtalo de nuevo.',
      });
    }
  }

  if (state.kind === 'sent') return <SubmissionDone count={state.solicitudes} />;
  if (state.kind === 'error' && state.code) return <InvitationUnavailable code={state.code} />;

  // Los errores posibles (longitud, formato de imagen) se muestran en cuanto ocurren.
  const fieldError = (key: keyof typeof errors): string | undefined => errors[key];
  const otherLines = researchLines.filter((line) => line.id !== perfil.lineaInvestigacionId);
  const mainLine = researchLines.find((line) => line.id === perfil.lineaInvestigacionId);

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <aside className="lg:col-span-4">
        <div className="rounded-card border border-rule bg-mist p-6">
          <p className="text-sm font-medium text-ink-muted">Perfil de</p>
          <p className="mt-1 text-lg font-semibold text-ink">{integrante.nombreCompleto}</p>
          {integrante.correoInstitucionalEnmascarado ? (
            <p className="mt-1 text-[0.9375rem] text-ink-muted">{integrante.correoInstitucionalEnmascarado}</p>
          ) : null}
          <p className="mt-5 flex items-start gap-2 text-sm text-ink-muted">
            <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              Este enlace caduca el <strong className="font-semibold text-ink">{formatDateTime(invitation.expiraEn)}</strong> y solo se
              puede usar una vez.
            </span>
          </p>
        </div>
        <ul className="mt-6 space-y-3 text-[0.9375rem] text-ink-muted">
          <li>Solo se envían los campos que modifiques.</li>
          <li>Ningún cambio se publica hasta que la coordinación lo apruebe.</li>
          <li>Tu CVU, teléfono y correo personal no aparecen en el sitio público.</li>
        </ul>
      </aside>

      <form noValidate onSubmit={onSubmit} aria-labelledby={`${formId}-title`} className="lg:col-span-8">
        <h2 id={`${formId}-title`} className="font-display text-[1.5rem] leading-tight font-semibold text-ink">
          Cambios propuestos
        </h2>

        {submitted && (errorCount > 0 || !changed) ? (
          <div
            role="alert"
            className="mt-6 flex gap-2.5 rounded-control border border-danger/25 bg-danger-50 px-4 py-3 text-[0.9375rem] text-danger"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {errorCount > 0
              ? errorCount === 1
                ? 'Revisa el campo marcado.'
                : `Revisa los ${errorCount} campos marcados.`
              : 'No has modificado ningún campo.'}
          </div>
        ) : null}
        {state.kind === 'error' ? (
          <div
            role="alert"
            className="mt-6 flex gap-2.5 rounded-control border border-danger/25 bg-danger-50 px-4 py-3 text-[0.9375rem] text-danger"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {state.message}
          </div>
        ) : null}

        <div className="mt-6 space-y-8">
          {/* Fotografía */}
          <fieldset className="rounded-card border border-rule p-5">
            <legend className="px-1 text-sm font-medium text-ink">Fotografía</legend>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Monogram
                nombres={integrante.nombreCompleto}
                apellidos=""
                fotoUrl={photoPreview ?? perfil.fotoUrl ?? undefined}
                size="xl"
                color="#1B396A"
              />
              <div className="flex-1">
                <label
                  htmlFor={`${formId}-foto`}
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-control border border-rule-strong bg-white px-4 text-[0.9375rem] font-semibold text-ink hover:border-brand-blue hover:bg-mist focus-within:ring-4 focus-within:ring-brand-green/15"
                >
                  <ImageUp className="size-4" aria-hidden="true" />
                  {photo ? 'Elegir otra fotografía' : 'Elegir fotografía'}
                  <input
                    id={`${formId}-foto`}
                    type="file"
                    accept={invitation.foto.formatos.join(',')}
                    className="sr-only"
                    aria-describedby={`${formId}-foto-ayuda ${errors.foto ? `${formId}-foto-error` : ''}`}
                    aria-invalid={errors.foto ? true : undefined}
                    onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                  />
                </label>
                {photo ? (
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="ml-2 inline-flex h-10 items-center gap-1.5 rounded-control px-3 text-[0.9375rem] text-ink-muted hover:bg-mist hover:text-ink"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Quitar
                  </button>
                ) : null}
                <p id={`${formId}-foto-ayuda`} className="mt-2 text-sm text-ink-subtle">
                  JPEG, PNG o WEBP de hasta {formatMb(invitation.foto.tamanoMaximoBytes)}. Se eliminan los metadatos de la imagen.
                </p>
                {fieldError('foto') ? (
                  <p id={`${formId}-foto-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-danger">
                    <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    {fieldError('foto')}
                  </p>
                ) : null}
              </div>
            </div>
          </fieldset>

          <FormField
            label="Biografía académica"
            htmlFor={`${formId}-bio`}
            error={fieldError('biografia')}
            errorId={`${formId}-bio-error`}
            hint={<Counter length={values.biografia.length} max={BIOGRAFIA_MAX_LENGTH} />}
          >
            <textarea
              id={`${formId}-bio`}
              rows={7}
              className="field-control resize-y"
              value={values.biografia}
              aria-invalid={errors.biografia ? true : undefined}
              aria-describedby={errors.biografia ? `${formId}-bio-error` : undefined}
              onChange={(e) => set('biografia', e.target.value)}
            />
          </FormField>

          <FormField
            label="Perfil profesional"
            htmlFor={`${formId}-perfil`}
            error={fieldError('perfilProfesional')}
            errorId={`${formId}-perfil-error`}
            hint={<Counter length={values.perfilProfesional.length} max={PERFIL_PROFESIONAL_MAX_LENGTH} />}
          >
            <textarea
              id={`${formId}-perfil`}
              rows={3}
              className="field-control resize-y"
              placeholder="Formación, cargo actual y áreas de especialidad"
              value={values.perfilProfesional}
              aria-invalid={errors.perfilProfesional ? true : undefined}
              aria-describedby={errors.perfilProfesional ? `${formId}-perfil-error` : undefined}
              onChange={(e) => set('perfilProfesional', e.target.value)}
            />
          </FormField>

          <fieldset>
            <legend className="text-sm font-medium text-ink">Líneas de investigación adicionales que propones</legend>
            {mainLine ? (
              <p className="mt-1 text-sm text-ink-muted">
                Tu línea principal es{' '}
                <strong className="font-semibold text-ink">
                  Línea {mainLine.numero}. {mainLine.nombreCorto}
                </strong>
                ; la cambia la coordinación.
              </p>
            ) : null}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {otherLines.map((line) => {
                const checked = values.lineasPropuestas.includes(line.id);
                return (
                  <label
                    key={line.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-control border px-3.5 py-3 text-[0.9375rem] transition-colors',
                      checked ? 'border-brand-green bg-brand-green-50' : 'border-rule-strong hover:bg-mist',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-4 accent-brand-green"
                      checked={checked}
                      onChange={() => toggleLine(line.id)}
                    />
                    <span className="text-ink">
                      <span className="font-semibold">Línea {line.numero}.</span> {line.nombreCorto}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="rounded-card border border-rule p-5">
            <legend className="px-1 text-sm font-medium text-ink">Correo institucional en el directorio</legend>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-brand-green"
                checked={values.solicitaCorreoPublico}
                onChange={(e) => set('solicitaCorreoPublico', e.target.checked)}
              />
              <span className="text-[0.9375rem] text-ink">{textoConsentimiento.texto}</span>
            </label>
            <p className="mt-3 text-sm text-ink-subtle">
              Versión del texto: {textoConsentimiento.version}. La autorización también pasa por aprobación de la coordinación.
            </p>
          </fieldset>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-4 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-subtle">Al enviar, este enlace deja de funcionar.</p>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={sending}
            icon={
              sending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />
            }
          >
            {sending ? (state.step === 'foto' ? 'Subiendo fotografía…' : 'Enviando cambios…') : 'Enviar a revisión'}
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------------- */

const UNAVAILABLE_COPY: Record<InvitationErrorCode, { title: string; body: string }> = {
  'invitacion-expirada': {
    title: 'Este enlace caducó',
    body: 'Los enlaces de actualización son válidos durante 24 horas. Solicita uno nuevo a la coordinación de la red.',
  },
  'invitacion-usada': {
    title: 'Este enlace ya se utilizó',
    body: 'Cada enlace solo se puede usar una vez. Si necesitas hacer otro cambio, solicita un enlace nuevo a la coordinación.',
  },
  'invitacion-invalida': {
    title: 'Este enlace no es válido',
    body: 'Revisa que hayas copiado la dirección completa desde tu correo institucional o solicita un enlace nuevo a la coordinación.',
  },
};

function InvitationUnavailable({ code, onRetry }: { code: InvitationErrorCode | null; onRetry?: () => void }) {
  const copy = code
    ? UNAVAILABLE_COPY[code]
    : { title: 'No pudimos verificar el enlace', body: 'Ocurrió un problema de conexión. Inténtalo de nuevo en unos minutos.' };
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-xl flex-col items-center rounded-panel border border-dashed border-rule-strong bg-mist/60 px-6 py-14 text-center"
    >
      <span className="grid size-12 place-items-center rounded-full bg-white text-brand-blue">
        <LinkIcon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-ink">{copy.title}</h2>
      <p className="mt-2 max-w-md text-ink-muted">{copy.body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!code && onRetry ? (
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        ) : null}
        <ButtonAnchor
          href={`mailto:${siteConfig.correoContacto}?subject=${encodeURIComponent('Solicitud de enlace para actualizar mi perfil')}`}
          variant="primary"
        >
          Escribir a la coordinación
        </ButtonAnchor>
      </div>
    </div>
  );
}

function SubmissionDone({ count }: { count: number }) {
  return (
    <div
      role="status"
      className="mx-auto flex max-w-xl flex-col items-center rounded-panel border border-rule bg-white px-6 py-14 text-center shadow-card"
    >
      <span className="grid size-12 place-items-center rounded-full bg-brand-green-50 text-brand-green">
        <CircleCheck className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-ink">Recibimos tu propuesta</h2>
      <p className="mt-2 max-w-md text-ink-muted">
        Enviaste {count === 1 ? '1 cambio' : `${count} cambios`} a revisión. La coordinación de la red los aprobará antes de que aparezcan
        en el directorio. Este enlace ya no se puede volver a usar.
      </p>
    </div>
  );
}

function Counter({ length, max }: { length: number; max: number }) {
  return (
    <span className={cn('tabular-nums', length > max && 'font-semibold text-danger')}>
      {length.toLocaleString('es-MX')}/{max.toLocaleString('es-MX')}
    </span>
  );
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso));
}

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toLocaleString('es-MX', { maximumFractionDigits: 1 })} MB`;
}

/**
 * El token viaja en la URL: se evita que los buscadores indexen la página y
 * que el navegador envíe la dirección completa como `Referer` a otros sitios.
 */
function usePrivatePageMeta(): void {
  useEffect(() => {
    const added: HTMLMetaElement[] = [];
    for (const [name, content] of [
      ['robots', 'noindex, nofollow'],
      ['referrer', 'no-referrer'],
    ] as const) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
      added.push(meta);
    }
    return () => added.forEach((meta) => meta.remove());
  }, []);
}
