import { describe, expect, it } from "vitest";

import {
  createFieldDataset,
  FIELD_INDEX_SEED,
  sampleSignals,
  type SamplingScale,
} from "../src/lib/field-index-model";

describe("Field Index model", () => {
  it("creates the same field for the same seed", () => {
    expect(createFieldDataset(FIELD_INDEX_SEED)).toEqual(
      createFieldDataset(FIELD_INDEX_SEED),
    );
  });

  it("creates a distinct field for a different seed", () => {
    const first = createFieldDataset(FIELD_INDEX_SEED);
    const second = createFieldDataset(FIELD_INDEX_SEED + 1);

    expect(second.signals).not.toEqual(first.signals);
    expect(second.routes).not.toEqual(first.routes);
  });

  it("keeps every drawable coordinate normalized", () => {
    const dataset = createFieldDataset();
    const coordinates = [
      ...dataset.signals.map(({ x, y }) => ({ x, y })),
      ...dataset.routes.flat(),
      ...dataset.notes.map(({ x, y }) => ({ x, y })),
    ];

    expect(coordinates).toHaveLength(192 + 36 + 6);
    for (const coordinate of coordinates) {
      expect(coordinate.x).toBeGreaterThanOrEqual(0);
      expect(coordinate.x).toBeLessThanOrEqual(1);
      expect(coordinate.y).toBeGreaterThanOrEqual(0);
      expect(coordinate.y).toBeLessThanOrEqual(1);
    }
  });

  it("returns predictable, nested density samples", () => {
    const dataset = createFieldDataset();
    const expectedCounts: Record<SamplingScale, number> = {
      1: 24,
      2: 48,
      4: 96,
      8: 192,
    };
    const scales = [1, 2, 4, 8] as const;
    let previousIds = new Set<string>();

    for (const scale of scales) {
      const sample = sampleSignals(dataset, scale);
      const currentIds = new Set(sample.map((signal) => signal.id));

      expect(sample).toHaveLength(expectedCounts[scale]);
      for (const id of previousIds) expect(currentIds.has(id)).toBe(true);
      previousIds = currentIds;
    }
  });

  it("rejects unsupported scale values", () => {
    const dataset = createFieldDataset();
    expect(() => sampleSignals(dataset, 3 as SamplingScale)).toThrow(RangeError);
  });
});
