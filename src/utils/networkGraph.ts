/**
 * Genera de forma determinista el grafo ilustrativo del hero: un nodo por
 * integrante, agrupados en tantos núcleos como líneas de investigación, con
 * un nodo central por línea y conexiones transversales entre núcleos.
 *
 * La distribución es ilustrativa (reparto equitativo): no representa la
 * afiliación real de los integrantes a cada línea.
 */

export interface GraphNode {
  id: number;
  x: number;
  y: number;
  r: number;
  cluster: number;
  hub: boolean;
}

export type EdgeKind = 'intra' | 'hub' | 'cross';

export interface GraphEdge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cluster: number;
  kind: EdgeKind;
}

export interface NetworkGraph {
  width: number;
  height: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  hubs: GraphNode[];
}

interface GraphOptions {
  nodeCount: number;
  clusterCount: number;
  width?: number;
  height?: number;
  seed?: number;
}

/** PRNG determinista (mulberry32): el grafo es idéntico en cada render y en SSR. */
function createRandom(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

export function buildNetworkGraph({
  nodeCount,
  clusterCount,
  width = 560,
  height = 520,
  seed = 2024,
}: GraphOptions): NetworkGraph {
  const random = createRandom(seed);
  const cx = width / 2;
  const cy = height / 2;
  const ringRadius = Math.min(width, height) * 0.3;
  const clusterRadius = Math.min(width, height) * 0.155;
  const minGap = 15;

  const nodes: GraphNode[] = [];
  const hubs: GraphNode[] = [];

  // Centros de cada núcleo sobre un anillo (pentágono para cinco líneas).
  for (let c = 0; c < clusterCount; c += 1) {
    const angle = -Math.PI / 2 + (c * 2 * Math.PI) / clusterCount;
    const hub: GraphNode = {
      id: nodes.length,
      x: cx + Math.cos(angle) * ringRadius,
      y: cy + Math.sin(angle) * ringRadius,
      r: 7,
      cluster: c,
      hub: true,
    };
    nodes.push(hub);
    hubs.push(hub);
  }

  // Resto de nodos repartidos alrededor de cada núcleo.
  const remaining = Math.max(0, nodeCount - clusterCount);
  for (let i = 0; i < remaining; i += 1) {
    const cluster = i % clusterCount;
    const hub = hubs[cluster];
    let candidate = { x: hub.x, y: hub.y };

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const angle = random() * Math.PI * 2;
      const radius = clusterRadius * (0.35 + Math.sqrt(random()) * 0.75);
      candidate = { x: hub.x + Math.cos(angle) * radius, y: hub.y + Math.sin(angle) * radius };
      if (nodes.every((n) => distance(n, candidate) >= minGap)) break;
    }

    nodes.push({
      id: nodes.length,
      x: candidate.x,
      y: candidate.y,
      r: 2.4 + random() * 1.8,
      cluster,
      hub: false,
    });
  }

  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const addEdge = (a: GraphNode, b: GraphNode, kind: EdgeKind): void => {
    const key = a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ id: key, x1: a.x, y1: a.y, x2: b.x, y2: b.y, cluster: a.cluster, kind });
  };

  // Dentro de cada núcleo: cada nodo con sus dos vecinos más cercanos y con su nodo central.
  for (const node of nodes) {
    if (node.hub) continue;
    const neighbours = nodes
      .filter((n) => n.cluster === node.cluster && n.id !== node.id && !n.hub)
      .sort((a, b) => distance(node, a) - distance(node, b))
      .slice(0, 2);
    for (const n of neighbours) addEdge(node, n, 'intra');
    if (distance(node, hubs[node.cluster]) < clusterRadius * 0.85) addEdge(hubs[node.cluster], node, 'intra');
  }

  // Entre núcleos: todos los nodos centrales conectados entre sí (una sola red transversal).
  for (let a = 0; a < hubs.length; a += 1) {
    for (let b = a + 1; b < hubs.length; b += 1) addEdge(hubs[a], hubs[b], 'hub');
  }

  // Algunos puentes entre integrantes de núcleos vecinos.
  for (let c = 0; c < clusterCount; c += 1) {
    const next = (c + 1) % clusterCount;
    const fromCluster = nodes.filter((n) => n.cluster === c && !n.hub);
    const toCluster = nodes.filter((n) => n.cluster === next && !n.hub);
    const pairs = fromCluster
      .flatMap((a) => toCluster.map((b) => ({ a, b, d: distance(a, b) })))
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    for (const { a, b } of pairs) addEdge(a, b, 'cross');
  }

  return { width, height, nodes, edges, hubs };
}
