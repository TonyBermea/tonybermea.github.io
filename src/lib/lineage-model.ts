export const PROTOCOL_VARIANTS = ["us", "eu", "jp"] as const;

export type ProtocolVariantId = (typeof PROTOCOL_VARIANTS)[number];

export interface ProtocolChange {
  readonly field: string;
  readonly section: string;
  readonly before: string;
  readonly after: string;
}

export interface ProtocolVariant {
  readonly id: ProtocolVariantId;
  readonly label: string;
  readonly commit: string;
  readonly added: number;
  readonly modified: number;
  readonly removed: number;
  readonly changes: readonly ProtocolChange[];
}

export const PROTOCOL_BASE = {
  label: "main",
  commit: "f9d04bd",
  version: "2.2",
} as const;

export const PROTOCOL_VARIANT_DATA: Readonly<Record<ProtocolVariantId, ProtocolVariant>> = {
  us: {
    id: "us",
    label: "United States",
    commit: "80a47de",
    added: 1,
    modified: 4,
    removed: 0,
    changes: [
      { field: "Protocol version", section: "Document control", before: "2.2", after: "2.3-US" },
      { field: "Planned sites", section: "Study design", before: "Approx. 160 across 14 regions", after: "72 sites in the United States" },
      { field: "SAE reporting", section: "Safety", before: "Report per regional requirements", after: "FDA 7- and 15-day reporting windows" },
      { field: "Trial registry", section: "Registration", before: "Registry assignment pending", after: "ClinicalTrials.gov · NCT05288413" },
    ],
  },
  eu: {
    id: "eu",
    label: "European Union",
    commit: "62c0f06",
    added: 0,
    modified: 6,
    removed: 0,
    changes: [
      { field: "Protocol version", section: "Document control", before: "2.2", after: "2.1-EU" },
      { field: "Primary endpoint", section: "Endpoints", before: "Week 72", after: "Week 80" },
      { field: "Treatment duration", section: "Study design", before: "72-week treatment period", after: "68-week treatment period" },
      { field: "Data protection", section: "Governance", before: "Regional privacy controls", after: "GDPR and EU retention controls" },
    ],
  },
  jp: {
    id: "jp",
    label: "Japan",
    commit: "8d982f6",
    added: 1,
    modified: 3,
    removed: 1,
    changes: [
      { field: "Protocol version", section: "Document control", before: "2.2", after: "2.1-JP" },
      { field: "Primary endpoint", section: "Endpoints", before: "Week 72", after: "Week 68" },
      { field: "Planned sites", section: "Study design", before: "Approx. 160 across 14 regions", after: "38 sites in Japan" },
      { field: "Consent record", section: "Governance", before: "Master consent form", after: "Japanese-language consent per PMDA guidance" },
    ],
  },
};

export function getProtocolVariant(id: ProtocolVariantId): ProtocolVariant {
  const variant = PROTOCOL_VARIANT_DATA[id];
  if (!variant) throw new RangeError(`Unknown protocol variant: ${id}`);
  return variant;
}

export function protocolChangeCount(variant: ProtocolVariant): number {
  return variant.added + variant.modified + variant.removed;
}
