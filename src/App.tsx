import { MotionConfig } from 'framer-motion';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AppRouter } from '@/routes/AppRouter';

export default function App() {
  // reducedMotion="user": las animaciones se desactivan si el sistema
  // operativo tiene activada la preferencia "reducir movimiento".
  return (
    // Límite exterior: último recurso si falla el propio enrutador o el layout.
    // Cada página tiene además su propio límite dentro de MainLayout.
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <AppRouter />
      </MotionConfig>
    </ErrorBoundary>
  );
}
