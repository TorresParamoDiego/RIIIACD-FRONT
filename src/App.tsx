import { MotionConfig } from 'framer-motion';
import { AppRouter } from '@/routes/AppRouter';

export default function App() {
  // reducedMotion="user": las animaciones se desactivan si el sistema
  // operativo tiene activada la preferencia "reducir movimiento".
  return (
    <MotionConfig reducedMotion="user">
      <AppRouter />
    </MotionConfig>
  );
}
