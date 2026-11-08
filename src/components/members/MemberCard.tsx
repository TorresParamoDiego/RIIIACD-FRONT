import { Building2 } from 'lucide-react';
import { Monogram } from '@/components/common/Monogram';
import { NEUTRAL_LINE_COLOR, getLineTheme } from '@/theme/lineThemes';
import type { PublicMember } from '@/types/member';
import type { ResearchLine } from '@/types/research';
import { formatMemberName } from '@/utils/members';

interface MemberCardProps {
  member: PublicMember;
  institutionName: string;
  line?: ResearchLine;
  onOpen: (id: string) => void;
}

export function MemberCard({ member, institutionName, line, onOpen }: MemberCardProps) {
  const color = getLineTheme(member.lineaInvestigacionId)?.color ?? NEUTRAL_LINE_COLOR;
  const headingId = `integrante-${member.id}`;

  return (
    <article
      aria-labelledby={headingId}
      className="group relative flex h-full flex-col rounded-card border border-rule bg-white p-5 transition-[border-color,box-shadow] duration-200 hover:border-rule-strong hover:shadow-card focus-within:border-electric-600 focus-within:ring-4 focus-within:ring-electric-600/15"
    >
      <div className="flex items-start gap-4">
        <Monogram nombres={member.nombres} apellidos={member.apellidos} color={color} fotoUrl={member.fotoUrl} />
        <div className="min-w-0 flex-1">
          <h3 id={headingId} className="leading-snug font-semibold text-navy-950">
            <button
              type="button"
              onClick={() => onOpen(member.id)}
              className="text-left after:absolute after:inset-0 after:rounded-card focus-visible:outline-none"
              aria-haspopup="dialog"
            >
              {formatMemberName(member)}
            </button>
          </h3>
          <p className="mt-1 text-sm font-medium text-electric-700">{member.rol}</p>
        </div>
        {member.esDemostrativo ? (
          <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
            Demo
          </span>
        ) : null}
      </div>

      <dl className="mt-5 space-y-2.5 border-t border-rule pt-4 text-sm">
        <div className="flex items-start gap-2.5">
          <dt className="sr-only">Institución</dt>
          <Building2 className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
          <dd className="text-ink-muted">{institutionName}</dd>
        </div>
        <div className="flex items-start gap-2.5">
          <dt className="sr-only">Línea de investigación</dt>
          <span className="mt-1.5 ml-1 size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
          <dd className="ml-0.5 text-ink-muted">{line ? `Línea ${line.numero}: ${line.nombreCorto}` : 'Línea por definir'}</dd>
        </div>
      </dl>
    </article>
  );
}
