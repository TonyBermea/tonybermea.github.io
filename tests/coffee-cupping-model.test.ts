import { describe, expect, it } from "vitest";

import {
  CUPPING_LOTS,
  CUPPING_METRICS,
  formatCuppingValue,
  getCuppingLot,
  metricAverage,
} from "../src/lib/coffee-cupping-model";

describe("Coffee Cupping model", () => {
  it("keeps five source lots and six representative metrics in a stable order", () => {
    expect(CUPPING_LOTS).toHaveLength(5);
    expect(CUPPING_METRICS).toHaveLength(6);
    expect(CUPPING_LOTS.map((lot) => lot.id)).toEqual([
      "finca-las-luz",
      "el-paraiso",
      "konga",
      "nguvu-aa",
      "cerrado-sul",
    ]);
  });

  it("formats source scores and deterministic room deltas", () => {
    const paraiso = getCuppingLot("el-paraiso");
    expect(formatCuppingValue(paraiso, "flavor", "absolute")).toBe("9.25");
    expect(formatCuppingValue(paraiso, "flavor", "delta")).toBe("+0.95");
    expect(metricAverage("flavor")).toBeCloseTo(8.3, 8);
  });

  it("rejects unknown lot identifiers", () => {
    expect(() => getCuppingLot("not-a-lot" as never)).toThrow(RangeError);
  });
});
