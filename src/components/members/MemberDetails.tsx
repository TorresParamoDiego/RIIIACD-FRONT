import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Mail, X } from 'lucide-react';
import { Monogram } from '@/components/common/Monogram';
import { researchLinePath } from '@/config/site';
import { getInstitutionTypeInfo } from '@/data/institutions';
import { researchLines } from '@/data/researchLines';
import { NEUTRAL_LINE_COLOR, getLineTheme } from '@/theme/lineThemes';
import type { Institution } from '@/types/institution';
import type { PublicMember } from '@/types/member';
import type { ResearchLine } from '@/types/research';
import { formatMemberName } from '@/utils/members';

interface MemberDetailsProps {
  member: PublicMember | undefined;
  institution?: Institution;
  institutionName: string;
  line?: ResearchLine;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Ficha del integrante en un diálogo modal accesible (Esc, foco atrapado, retorno de foco). */
export function MemberDetails({ member, institution, institutionName, line, onClose }: MemberDetailsProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = member !== undefined;
  // Referencia estable: evita reiniciar el efecto si el padre recrea `onClose`.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  const color = getLineTheme(member?.lineaInvestigacionId)?.color ?? NEUTRAL_LINE_COLOR;
  const extraLines = researchLines.filter((l) => member?.lineasPropuestas?.includes(l.id) && l.id !== member.lineaInvestigacionId);

  return (
    <AnimatePresence>
      {member ? (
        <motion.div
          key="ficha"
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ficha-titulo"
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-panel bg-white shadow-raised sm:max-w-lg sm:rounded-panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="h-1.5 w-full" style={{ backgroundColor: color }} aria-hidden="true" />
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <Monogram nombres={member.nombres} apellidos={member.apellidos} color={color} fotoUrl={member.fotoUrl} size="lg" />
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  className="-mt-1 -mr-2 grid size-10 place-items-center rounded-control text-ink-subtle hover:bg-mist hover:text-ink"
                  aria-label="Cerrar ficha"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>

              <p className="mt-5 text-[0.9375rem] font-semibold text-brand-green">{member.rol}</p>
              <h2 id="ficha-titulo" className="mt-1 font-display text-[1.625rem] leading-tight font-semibold text-ink text-balance">
                {formatMemberName(member)}
              </h2>
              {member.esDemostrativo ? (
                <p className="mt-3 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                  Registro demostrativo: no corresponde a una persona real
                </p>
              ) : null}

              {member.perfilProfesional ? (
                <p className="mt-4 text-[1.0625rem] leading-snug font-medium text-ink-muted">{member.perfilProfesional}</p>
              ) : null}
              {member.biografia ? (
                <section aria-label="Biografía académica" className="mt-5">
                  <p className="text-[0.9375rem] leading-relaxed whitespace-pre-line text-ink-muted">{member.biografia}</p>
                </section>
              ) : null}

              <dl className="mt-7 divide-y divide-rule border-y border-rule">
                <div className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm text-ink-subtle">Institución de adscripción</dt>
                  <dd className="flex items-start gap-2 text-ink">
                    <Building2 className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    <span>
                      {institutionName}
                      {institution ? (
                        <span className="block text-sm text-ink-muted">{getInstitutionTypeInfo(institution.tipo).etiqueta}</span>
                      ) : null}
                    </span>
                  </dd>
                </div>
                <div className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm text-ink-subtle">Línea de investigación</dt>
                  <dd className="text-ink">
                    {line ? (
                      <Link
                        to={researchLinePath(line.slug)}
                        className="underline decoration-rule-strong underline-offset-4 hover:decoration-brand-green"
                      >
                        Línea {line.numero}: {line.nombre}
                      </Link>
                    ) : (
                      <span className="text-ink-muted">Por definir</span>
                    )}
                  </dd>
                </div>
                {extraLines.length > 0 ? (
                  <div className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
                    <dt className="text-sm text-ink-subtle">También colabora en</dt>
                    <dd className="text-ink">
                      <ul className="space-y-1">
                        {extraLines.map((extra) => (
                          <li key={extra.id}>
                            <Link
                              to={researchLinePath(extra.slug)}
                              className="underline decoration-rule-strong underline-offset-4 hover:decoration-brand-green"
                            >
                              Línea {extra.numero}: {extra.nombreCorto}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ) : null}
                <div className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm text-ink-subtle">Correo institucional</dt>
                  <dd>
                    {member.correoPublico ? (
                      <a
                        href={`mailto:${member.correoPublico}`}
                        className="inline-flex items-center gap-2 break-all text-brand-green hover:text-ink"
                      >
                        <Mail className="size-4 shrink-0" aria-hidden="true" />
                        {member.correoPublico}
                      </a>
                    ) : (
                      <span className="text-sm text-ink-muted">
                        No publicado. Solo se muestra con autorización del integrante aprobada por la coordinación.
                      </span>
                    )}
                  </dd>
                </div>
              </dl>

              {member.perfilAcademicoUrl ? (
                <a
                  href={member.perfilAcademicoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex text-[0.9375rem] font-semibold text-brand-green hover:text-ink"
                >
                  Ver perfil académico
                </a>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
