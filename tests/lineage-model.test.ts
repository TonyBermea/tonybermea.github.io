import { describe, expect, it } from "vitest";

import {
  PROTOCOL_BASE,
  PROTOCOL_VARIANTS,
  getProtocolVariant,
  protocolChangeCount,
} from "../src/lib/lineage-model";

describe("Lineage protocol model", () => {
  it("keeps main fixed and exposes three deterministic regional branches", () => {
    expect(PROTOCOL_BASE).toMatchObject({ label: "main", commit: "f9d04bd" });
    expect(PROTOCOL_VARIANTS).toEqual(["us", "eu", "jp"]);
    expect(getProtocolVariant("eu").commit).toBe("62c0f06");
  });

  it("reports deterministic change totals", () => {
    expect(protocolChangeCount(getProtocolVariant("us"))).toBe(5);
    expect(protocolChangeCount(getProtocolVariant("eu"))).toBe(6);
    expect(protocolChangeCount(getProtocolVariant("jp"))).toBe(5);
  });

  it("keeps representative before and after fields for every branch", () => {
    for (const id of PROTOCOL_VARIANTS) {
      const branch = getProtocolVariant(id);
      expect(branch.changes.length).toBeGreaterThanOrEqual(4);
      for (const change of branch.changes) {
        expect(change.before).not.toBe(change.after);
        expect(change.field.length).toBeGreaterThan(0);
      }
    }
  });
});
