import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Menu, X } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { ROUTES, mainNavigation, siteConfig } from '@/config/site';
import { cn } from '@/utils/cn';

const SCROLL_THRESHOLD = 24;

export function Navbar() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cierra el menú móvil al navegar.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Todas las páginas abren con una banda azul marino: la barra es
  // transparente sobre ella y se vuelve sólida al desplazarse.
  const solid = scrolled || open;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300',
        solid
          ? 'border-b border-rule bg-white/95 shadow-[0_8px_24px_-18px_rgb(7_27_53/0.35)] backdrop-blur-md'
          : 'on-dark border-b border-white/10 bg-transparent',
      )}
    >
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-6">
        <Link to={ROUTES.inicio} className="rounded-md" aria-label={`${siteConfig.siglas}, ir al inicio`}>
          <Logo tone={solid ? 'light' : 'dark'} />
        </Link>

        <nav aria-label="Navegación principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNavigation.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === ROUTES.inicio}
                  className={({ isActive }) =>
                    cn(
                      'relative rounded-md px-3 py-2 text-[0.9375rem] font-medium transition-colors',
                      solid
                        ? isActive
                          ? 'text-navy-950'
                          : 'text-ink-muted hover:text-navy-950'
                        : isActive
                          ? 'text-white'
                          : 'text-white/70 hover:text-white',
                      isActive &&
                        'after:absolute after:inset-x-3 after:-bottom-[1.2rem] after:h-0.5 after:rounded-full after:bg-signal',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={cn(
            'grid size-11 place-items-center rounded-control lg:hidden',
            solid ? 'text-navy-950 hover:bg-mist' : 'text-white hover:bg-white/10',
          )}
          aria-expanded={open}
          aria-controls="menu-movil"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.nav
            id="menu-movil"
            aria-label="Navegación principal"
            className="overflow-hidden border-t border-rule bg-white lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <ul className="container-page flex flex-col py-3">
              {mainNavigation.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === ROUTES.inicio}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between rounded-control px-3 py-3.5 text-[1.0625rem] font-medium',
                        isActive ? 'bg-electric-50 text-navy-950' : 'text-ink-muted hover:bg-mist hover:text-navy-950',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        {isActive ? <span className="size-1.5 rounded-full bg-electric-600" aria-hidden="true" /> : null}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="container-page border-t border-rule py-4">
              <a
                href={`mailto:${siteConfig.correoContacto}`}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-[0.9375rem] text-ink-muted hover:text-navy-950"
              >
                <Mail className="size-4" aria-hidden="true" />
                {siteConfig.correoContacto}
              </a>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
