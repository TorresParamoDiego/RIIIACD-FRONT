import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LoadingState } from '@/components/common/LoadingState';
import { MainLayout } from '@/components/layout/MainLayout';
import { ROUTES } from '@/config/site';
import Home from '@/pages/Home';

// La portada se carga de inmediato; el resto de páginas se divide en
// fragmentos para reducir el peso inicial (Recharts solo en Instituciones).
const About = lazy(() => import('@/pages/About'));
const ResearchLines = lazy(() => import('@/pages/ResearchLines'));
const ResearchLineDetail = lazy(() => import('@/pages/ResearchLineDetail'));
const Members = lazy(() => import('@/pages/Members'));
const Institutions = lazy(() => import('@/pages/Institutions'));
const Contact = lazy(() => import('@/pages/Contact'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageFallback() {
  return (
    <div className="min-h-[70vh] bg-white pt-28">
      <LoadingState label="Cargando página…" />
    </div>
  );
}

function withSuspense(element: ReactNode): ReactNode {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path={ROUTES.nosotros} element={withSuspense(<About />)} />
          <Route path={ROUTES.lineas} element={withSuspense(<ResearchLines />)} />
          <Route path={`${ROUTES.lineas}/:slug`} element={withSuspense(<ResearchLineDetail />)} />
          <Route path={ROUTES.integrantes} element={withSuspense(<Members />)} />
          <Route path={ROUTES.instituciones} element={withSuspense(<Institutions />)} />
          <Route path={ROUTES.contacto} element={withSuspense(<Contact />)} />
          <Route path="*" element={withSuspense(<NotFound />)} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
