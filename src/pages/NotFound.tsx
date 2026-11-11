import { ArrowLeft } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES, mainNavigation } from '@/config/site';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Página no encontrada');

  return (
    <>
      <PageHeader
        title="No encontramos esta página"
        breadcrumbs={[{ label: 'Página no encontrada' }]}
        description="Es posible que la dirección esté mal escrita o que la página haya cambiado de lugar."
      >
        <ButtonLink to={ROUTES.inicio} variant="onDark" icon={<ArrowLeft className="size-4" aria-hidden="true" />} iconPosition="start">
          Volver al inicio
        </ButtonLink>
      </PageHeader>
      <section className="container-page py-14" aria-labelledby="secciones-titulo">
        <h2 id="secciones-titulo" className="text-[1.0625rem] font-semibold text-ink">
          Secciones del sitio
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {mainNavigation.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="inline-flex h-10 items-center rounded-full border border-rule-strong px-4 text-[0.9375rem] font-medium text-ink hover:border-brand-blue hover:bg-mist"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
