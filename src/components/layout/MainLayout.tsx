import { useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

/** Lleva la vista al inicio al cambiar de página (no al cambiar filtros en la URL). */
function useScrollToTopOnNavigate(pathname: string): void {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
}

export function MainLayout() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  useScrollToTopOnNavigate(pathname);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only z-[60] rounded-control bg-white px-4 py-2 font-semibold text-navy-950 shadow-raised focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="contenido"
          key={pathname}
          tabIndex={-1}
          className="flex-1 outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {outlet}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
