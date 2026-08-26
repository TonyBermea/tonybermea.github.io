export const CUPPING_MODES = ["absolute", "delta"] as const;

export type CuppingMode = (typeof CUPPING_MODES)[number];

export const CUPPING_METRICS = [
  { id: "fragrance", label: "Fragrance" },
  { id: "flavor", label: "Flavor" },
  { id: "aftertaste", label: "Aftertaste" },
  { id: "acidity", label: "Acidity" },
  { id: "body", label: "Body" },
  { id: "balance", label: "Balance" },
] as const;

export type CuppingMetricId = (typeof CUPPING_METRICS)[number]["id"];

export interface CuppingLot {
  readonly id: string;
  readonly shortLabel: string;
  readonly label: string;
  readonly origin: string;
  readonly process: string;
  readonly pricePerPound: number;
  readonly totalSca: number;
  readonly values: Readonly<Record<CuppingMetricId, number>>;
}

export const CUPPING_LOTS = [
  {
    id: "finca-las-luz",
    shortLabel: "Las Luz",
    label: "Finca Las Luz",
    origin: "Huila, Colombia",
    process: "Washed",
    pricePerPound: 4.5,
    totalSca: 84.5,
    values: { fragrance: 8.5, flavor: 8, aftertaste: 7.75, acidity: 7.5, body: 8, balance: 8 },
  },
  {
    id: "el-paraiso",
    shortLabel: "Paraíso",
    label: "El Paraíso",
    origin: "Cauca, Colombia",
    process: "Thermal Shock",
    pricePerPound: 7.5,
    totalSca: 90.3,
    values: { fragrance: 9, flavor: 9.25, aftertaste: 8.75, acidity: 8.5, body: 7.75, balance: 8.75 },
  },
  {
    id: "konga",
    shortLabel: "Konga",
    label: "Konga",
    origin: "Yirgacheffe, Ethiopia",
    process: "Natural",
    pricePerPound: 5.1,
    totalSca: 87,
    values: { fragrance: 9, flavor: 8.75, aftertaste: 8.25, acidity: 8.75, body: 7.25, balance: 8.25 },
  },
  {
    id: "nguvu-aa",
    shortLabel: "Nguvu AA",
    label: "Nguvu AA",
    origin: "Nyeri, Kenya",
    process: "Washed",
    pricePerPound: 6.2,
    totalSca: 85.3,
    values: { fragrance: 8.5, flavor: 8.5, aftertaste: 8, acidity: 9, body: 7.5, balance: 8 },
  },
  {
    id: "cerrado-sul",
    shortLabel: "Cerrado",
    label: "Cerrado Sul",
    origin: "Minas Gerais, Brazil",
    process: "Pulped Natural",
    pricePerPound: 3.8,
    totalSca: 76,
    values: { fragrance: 7.25, flavor: 7, aftertaste: 6.75, acidity: 6.5, body: 8.25, balance: 7.25 },
  },
] as const satisfies readonly CuppingLot[];

export type CuppingLotId = (typeof CUPPING_LOTS)[number]["id"];

export function metricAverage(metric: CuppingMetricId): number {
  return CUPPING_LOTS.reduce((total, lot) => total + lot.values[metric], 0) / CUPPING_LOTS.length;
}

export function metricDelta(lot: CuppingLot, metric: CuppingMetricId): number {
  return lot.values[metric] - metricAverage(metric);
}

export function formatCuppingValue(
  lot: CuppingLot,
  metric: CuppingMetricId,
  mode: CuppingMode,
): string {
  if (mode === "absolute") return lot.values[metric].toFixed(2);
  const delta = metricDelta(lot, metric);
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}`;
}

export function getCuppingLot(id: CuppingLotId): CuppingLot {
  const lot = CUPPING_LOTS.find((candidate) => candidate.id === id);
  if (!lot) throw new RangeError(`Unknown coffee lot: ${id}`);
  return lot;
}
