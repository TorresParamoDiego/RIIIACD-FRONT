import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function Boom({ fail }: { fail: boolean }) {
  if (fail) throw new Error('fallo de prueba');
  return <p>Contenido correcto</p>;
}

describe('ErrorBoundary', () => {
  it('muestra un mensaje en lugar de una pantalla en blanco y permite reintentar', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Harness() {
      const [fail, setFail] = useState(true);
      return (
        <>
          <button onClick={() => setFail(false)}>arreglar</button>
          <ErrorBoundary>
            <Boom fail={fail} />
          </ErrorBoundary>
        </>
      );
    }
    render(<Harness />);
    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal');
    fireEvent.click(screen.getByText('arreglar'));
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(screen.getByText('Contenido correcto')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('se reinicia cuando cambian las resetKeys (navegación)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <ErrorBoundary resetKeys={['/a']}>
        <Boom fail />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    rerender(
      <ErrorBoundary resetKeys={['/b']}>
        <Boom fail={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Contenido correcto')).toBeInTheDocument();
    spy.mockRestore();
  });
});
