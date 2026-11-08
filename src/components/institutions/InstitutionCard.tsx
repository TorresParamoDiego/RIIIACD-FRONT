import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/config/site';
import { getInstitutionTypeInfo } from '@/data/institutions';
import { institutionTypeColors } from '@/theme/institutionTheme';
import type { InstitutionWithCount } from '@/types/institution';
import { plural } from '@/utils/text';

interface InstitutionCardProps {
  institution: InstitutionWithCount;
}

export function InstitutionCard({ institution }: InstitutionCardProps) {
  const typeInfo = getInstitutionTypeInfo(institution.tipo);
  const color = institutionTypeColors[institution.tipo];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-rule bg-white transition-shadow duration-200 hover:shadow-card">
      {/* Espacio reservado para el logotipo oficial */}
      <div className="relative grid aspect-[16/9] place-items-center border-b border-rule bg-mist/70">
        {institution.logoUrl ? (
          <img
            src={institution.logoUrl}
            alt={`Logotipo de ${institution.nombre}`}
            className="max-h-[60%] max-w-[70%] object-contain"
            loading="lazy"
          />
        ) : (
          <span className="font-display text-[1.75rem] font-semibold tracking-tight text-navy-800/80" aria-hidden="true">
            {institution.siglas ?? institution.nombre.slice(0, 3)}
          </span>
        )}
        {institution.esDemostrativo ? (
          <span className="absolute top-3 right-3 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
            Demo
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <span className="size-2 rounded-sm" style={{ backgroundColor: color }} aria-hidden="true" />
          {typeInfo.etiqueta}
        </p>
        <h3 className="mt-2 leading-snug font-semibold text-navy-950 text-balance">{institution.nombre}</h3>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-[0.9375rem]">
          <span className="text-ink-muted">{plural(institution.integrantes, 'integrante', 'integrantes')}</span>
          {institution.integrantes > 0 ? (
            <Link
              to={`${ROUTES.integrantes}?institucion=${institution.id}`}
              className="inline-flex items-center gap-1 rounded font-semibold text-electric-700 hover:text-navy-950"
            >
              Ver
              <span className="sr-only"> integrantes de {institution.nombre}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
