import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw, TriangleAlert } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Cuando cambia alguno de estos valores, el límite se reinicia. En el
   * layout se pasa la ruta actual: al navegar a otra página el error se limpia.
   */
  resetKeys?: readonly unknown[];
  /** Contenido alternativo. Si no se indica, se muestra el mensaje estándar. */
  fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
  /** Gancho para enviar el error a un servicio de registro en el futuro. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Límite de errores de render. Evita que un fallo en una página deje la
 * pantalla en blanco: el encabezado y el pie siguen funcionando y se ofrece
 * reintentar o volver al inicio.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) console.error('[RIIIACD] Error de render', error, info.componentStack);
    this.props.onError?.(error, info);
  }

  override componentDidUpdate(prev: ErrorBoundaryProps): void {
    if (this.state.error && !sameKeys(prev.resetKeys, this.props.resetKeys)) this.reset();
  }

  reset = (): void => this.setState({ error: null });

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback({ error, reset: this.reset });
    return <DefaultFallback onRetry={this.reset} />;
  }
}

function sameKeys(a: readonly unknown[] = [], b: readonly unknown[] = []): boolean {
  return a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
}

function DefaultFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="container-page pt-32 pb-20">
      <div
        role="alert"
        className="mx-auto flex max-w-xl flex-col items-center rounded-panel border border-danger/25 bg-danger-50 px-6 py-14 text-center"
      >
        <span className="grid size-12 place-items-center rounded-full bg-white text-danger">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-ink">Algo salió mal al mostrar esta página</h1>
        <p className="mt-2 max-w-md text-ink-muted">
          Puedes reintentar o volver al inicio. Si el problema continúa, escribe a {siteConfig.correoContacto}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center gap-2 rounded-control bg-brand-green px-4 font-semibold text-white hover:bg-brand-green-hover"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reintentar
          </button>
          {/* Enlace normal (no <Link>): funciona aunque el enrutador sea lo que falló. */}
          <a
            href="/"
            className="inline-flex h-10 items-center rounded-control border border-rule-strong bg-white px-4 font-semibold text-ink hover:bg-mist"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
