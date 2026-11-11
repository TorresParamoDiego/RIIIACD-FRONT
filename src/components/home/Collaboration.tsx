import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Mail, Users, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/common/Reveal';
import { ROUTES } from '@/config/site';
import { networkStatistics } from '@/data/statistics';

interface Destination {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export function Collaboration() {
  const destinations: Destination[] = [
    {
      to: ROUTES.integrantes,
      icon: Users,
      title: 'Directorio de integrantes',
      description: `Consulta a las ${networkStatistics.integrantes} personas que forman la red por nombre, institución, línea o rol.`,
    },
    {
      to: ROUTES.instituciones,
      icon: Building2,
      title: 'Instituciones participantes',
      description: `Institutos tecnológicos, centros de investigación y universidades: ${networkStatistics.instituciones} instituciones en total.`,
    },
    {
      to: ROUTES.contacto,
      icon: Mail,
      title: 'Contacto',
      description: 'Escribe a la coordinación de la red para colaborar o resolver dudas.',
    },
  ];

  return (
    <section aria-labelledby="colaboracion-titulo" className="on-dark bg-brand-blue py-20 text-white sm:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <h2 id="colaboracion-titulo" className="font-display text-[2rem] leading-[1.1] font-semibold text-balance sm:text-[2.75rem]">
            Conoce a quienes hacen la red
          </h2>
          <p className="mt-5 max-w-[46ch] text-[1.0625rem] leading-relaxed text-white/70">
            La red se construye con el trabajo de investigadoras e investigadores de distintas instituciones. Explora quiénes participan y
            desde dónde lo hacen.
          </p>
        </Reveal>

        <ul className="divide-y divide-white/12 border-y border-white/12 lg:col-span-7">
          {destinations.map(({ to, icon: Icon, title, description }, index) => (
            <li key={to}>
              <Reveal delay={index * 0.06}>
                <Link to={to} className="group flex items-start gap-5 rounded-md py-7 transition-colors sm:items-center">
                  <span className="grid size-12 shrink-0 place-items-center rounded-control bg-white/8 text-brand-accent ring-1 ring-white/10">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[1.1875rem] font-semibold">{title}</span>
                    <span className="mt-1 block text-[0.9375rem] leading-relaxed text-white/65">{description}</span>
                  </span>
                  <ArrowRight
                    className="mt-1 size-5 shrink-0 text-white/40 transition-[color,transform] group-hover:translate-x-1 group-hover:text-brand-accent sm:mt-0"
                    aria-hidden="true"
                  />
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
