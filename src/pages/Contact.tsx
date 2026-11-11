import { Mail } from 'lucide-react';
import { ContactForm } from '@/components/contact/ContactForm';
import { Monogram } from '@/components/common/Monogram';
import { PageHeader } from '@/components/common/PageHeader';
import { siteConfig } from '@/config/site';
import { getDocumentedMemberById } from '@/data/members';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatMemberName } from '@/utils/members';

export default function Contact() {
  useDocumentTitle('Contacto');
  const leader = getDocumentedMemberById(siteConfig.liderRedId);

  return (
    <>
      <PageHeader
        title="Contacto"
        breadcrumbs={[{ label: 'Contacto' }]}
        description="Para colaborar con la red, sumar a tu institución o resolver dudas, escribe a la coordinación."
      />

      <div className="container-page grid gap-8 py-14 sm:py-20 lg:grid-cols-12 lg:gap-12">
        <aside className="flex flex-col gap-6 lg:col-span-5">
          <section aria-labelledby="correo-titulo" className="rounded-panel bg-brand-blue p-7 text-white on-dark sm:p-9">
            <h2 id="correo-titulo" className="text-[0.9375rem] font-semibold text-brand-accent">
              Correo de contacto
            </h2>
            <a
              href={`mailto:${siteConfig.correoContacto}`}
              className="mt-3 block rounded font-display text-[1.375rem] leading-snug font-semibold break-all hover:text-brand-accent sm:text-[1.5rem]"
            >
              {siteConfig.correoContacto}
            </a>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-white/65">
              Es el canal institucional de la red. Indica en el asunto el tema de tu mensaje para canalizarlo con la línea correspondiente.
            </p>
            <a
              href={`mailto:${siteConfig.correoContacto}`}
              className="mt-7 inline-flex h-11 items-center gap-2 rounded-control bg-white px-4 font-semibold text-ink hover:bg-brand-green-50"
            >
              <Mail className="size-4" aria-hidden="true" />
              Escribir un correo
            </a>
          </section>

          {leader ? (
            <section aria-labelledby="lider-titulo" className="flex items-center gap-4 rounded-panel border border-rule p-6">
              <Monogram nombres={leader.nombres} apellidos={leader.apellidos} size="lg" />
              <div>
                <h2 id="lider-titulo" className="text-sm font-medium text-ink-subtle">
                  {leader.rol}
                </h2>
                <p className="mt-0.5 text-[1.0625rem] leading-snug font-semibold text-ink">{formatMemberName(leader)}</p>
              </div>
            </section>
          ) : null}
        </aside>

        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </>
  );
}
