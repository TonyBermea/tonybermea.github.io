export const FIELD_INDEX_SEED = 4107;

export const SAMPLING_SCALES = [1, 2, 4, 8] as const;

export type SamplingScale = (typeof SAMPLING_SCALES)[number];

export interface FieldSignal {
  id: string;
  x: number;
  y: number;
  strength: number;
  phase: number;
  family: 0 | 1 | 2;
}

export interface FieldRoutePoint {
  x: number;
  y: number;
}

export interface FieldNote {
  id: string;
  x: number;
  y: number;
  index: number;
}

export interface FieldDataset {
  seed: number;
  signals: FieldSignal[];
  routes: FieldRoutePoint[][];
  notes: FieldNote[];
}

function makeRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/**
 * Produces the normalized, deterministic field shared by both interactive demos.
 * Coordinates deliberately stay in a 0–1 range so drawing can be responsive.
 */
export function createFieldDataset(seed = FIELD_INDEX_SEED): FieldDataset {
  const normalizedSeed = Number.isFinite(seed) ? seed >>> 0 : FIELD_INDEX_SEED;
  const random = makeRandom(normalizedSeed);
  const columns = 16;
  const rows = 12;
  const signals: FieldSignal[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const jitterX = (random() - 0.5) * 0.56;
      const jitterY = (random() - 0.5) * 0.56;

      signals.push({
        id: `signal-${row}-${column}`,
        x: (column + 0.5 + jitterX) / columns,
        y: (row + 0.5 + jitterY) / rows,
        strength: 0.34 + random() * 0.66,
        phase: random() * Math.PI * 2,
        family: Math.floor(random() * 3) as 0 | 1 | 2,
      });
    }
  }

  const routes = Array.from({ length: 3 }, (_, routeIndex) => {
    const routeRandom = makeRandom(normalizedSeed + 101 + routeIndex * 37);

    return Array.from({ length: 12 }, (_, pointIndex) => {
      const x = 0.02 + (pointIndex / 11) * 0.96;
      const baseline = 0.24 + routeIndex * 0.25;
      const wave = Math.sin(pointIndex * 0.72 + routeIndex * 1.3) * 0.065;
      const noise = (routeRandom() - 0.5) * 0.045;

      return {
        x,
        y: Math.min(0.94, Math.max(0.06, baseline + wave + noise)),
      };
    });
  });

  const noteSignalIndexes = [17, 46, 79, 116, 151, 182];
  const notes = noteSignalIndexes.map((signalIndex, index) => ({
    id: `note-${index + 1}`,
    x: signals[signalIndex].x,
    y: signals[signalIndex].y,
    index: index + 1,
  }));

  return {
    seed: normalizedSeed,
    signals,
    routes,
    notes,
  };
}

/**
 * Returns nested, evenly distributed subsets: every 1× point also appears at
 * 2×, every 2× point at 4×, and so on through the full 8× dataset.
 */
export function sampleSignals(
  dataset: FieldDataset,
  scale: SamplingScale,
): FieldSignal[] {
  if (!SAMPLING_SCALES.includes(scale)) {
    throw new RangeError(`Unsupported sampling scale: ${scale}`);
  }

  const stride = 8 / scale;
  return dataset.signals.filter((_, index) => index % stride === 0);
}
