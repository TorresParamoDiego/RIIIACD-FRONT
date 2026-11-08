import { useMemo, type CSSProperties } from 'react';
import { researchLines } from '@/data/researchLines';
import { lineThemes } from '@/theme/lineThemes';
import { buildNetworkGraph } from '@/utils/networkGraph';
import { cn } from '@/utils/cn';

interface NetworkGraphProps {
  /** Número de nodos: uno por integrante (se toma de las estadísticas). */
  nodeCount: number;
  className?: string;
}

const WIDTH = 560;
const HEIGHT = 520;

/**
 * Composición del hero: la red como grafo. Cada núcleo es una línea de
 * investigación con su color; los nodos centrales están conectados entre sí
 * para expresar "una sola red transversal". Es decorativa (aria-hidden):
 * su contenido ya está descrito en el texto de la página.
 */
export function NetworkGraph({ nodeCount, className }: NetworkGraphProps) {
  const graph = useMemo(
    () => buildNetworkGraph({ nodeCount, clusterCount: researchLines.length, width: WIDTH, height: HEIGHT }),
    [nodeCount],
  );

  const colorFor = (cluster: number): string => lineThemes[researchLines[cluster].id].colorOnDark;
  const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn('h-auto w-full overflow-visible', className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="graph-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={WIDTH * 0.42} fill="url(#graph-glow)" />

      {/* Conexiones transversales entre nodos centrales */}
      <g strokeLinecap="round">
        {graph.edges
          .filter((edge) => edge.kind === 'hub')
          .map((edge, i) => (
            <line
              key={edge.id}
              className="graph-edge"
              style={delay(0.9 + i * 0.05)}
              pathLength={1}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke="#22D3EE"
              strokeOpacity={0.42}
              strokeWidth={1.2}
            />
          ))}
      </g>

      {/* Conexiones dentro de cada línea y puentes entre líneas vecinas */}
      <g strokeLinecap="round">
        {graph.edges
          .filter((edge) => edge.kind !== 'hub')
          .map((edge) => (
            <line
              key={edge.id}
              className="graph-edge"
              style={delay(0.15 + edge.cluster * 0.12)}
              pathLength={1}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke={edge.kind === 'cross' ? '#FFFFFF' : colorFor(edge.cluster)}
              strokeOpacity={edge.kind === 'cross' ? 0.28 : 0.4}
              strokeWidth={edge.kind === 'cross' ? 0.9 : 1}
            />
          ))}
      </g>

      {/* Integrantes */}
      <g>
        {graph.nodes
          .filter((node) => !node.hub)
          .map((node) => (
            <circle
              key={node.id}
              className="graph-node"
              style={delay(0.1 + node.cluster * 0.12 + (node.id % 7) * 0.03)}
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill={colorFor(node.cluster)}
              fillOpacity={0.92}
            />
          ))}
      </g>

      {/* Nodos centrales y etiqueta de cada línea */}
      <g>
        {graph.hubs.map((hub) => {
          const line = researchLines[hub.cluster];
          const dx = hub.x - cx;
          const dy = hub.y - cy;
          const length = Math.hypot(dx, dy) || 1;
          const labelX = hub.x + (dx / length) * 96;
          const labelY = hub.y + (dy / length) * 92;
          const anchor = Math.abs(dx) < 20 ? 'middle' : dx > 0 ? 'start' : 'end';

          return (
            <g key={hub.id}>
              <circle
                className="graph-node"
                style={delay(0.75 + hub.cluster * 0.08)}
                cx={hub.x}
                cy={hub.y}
                r={16}
                fill={colorFor(hub.cluster)}
                fillOpacity={0.14}
              />
              <circle
                className="graph-node"
                style={delay(0.8 + hub.cluster * 0.08)}
                cx={hub.x}
                cy={hub.y}
                r={hub.r}
                fill={colorFor(hub.cluster)}
                stroke="#071B35"
                strokeWidth={2}
              />
              <text
                className="graph-label"
                style={delay(1.3 + hub.cluster * 0.06)}
                x={labelX}
                y={labelY}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill="#FFFFFF"
                fillOpacity={0.72}
                fontSize={15}
                fontWeight={600}
                fontFamily="Archivo, ui-sans-serif, system-ui, sans-serif"
              >
                Línea {line.numero}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
