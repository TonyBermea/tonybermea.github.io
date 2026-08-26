import type { SelectedWork } from "../lib/work";

/** Tony Bermea portfolio entries in their stable homepage order. */
export const selectedWork = [
  {
    kind: "case-study",
    slug: "field-index",
    order: 1,
    accent: "vermilion",
  },
  {
    kind: "case-study",
    slug: "coffee-cupping",
    order: 2,
    accent: "yellow",
  },
  {
    kind: "case-study",
    slug: "gumo-supplies",
    order: 3,
    accent: "green",
  },
  {
    kind: "case-study",
    slug: "lineage",
    order: 4,
    accent: "orange",
  },
  {
    kind: "case-study",
    slug: "npkn-studio",
    order: 5,
    accent: "blue",
  },
  {
    kind: "case-study",
    slug: "mchns",
    order: 6,
    accent: "violet",
  },
  {
    kind: "case-study",
    slug: "soul-mag",
    order: 7,
    accent: "pink",
  },
  {
    kind: "case-study",
    slug: "pixel-vault",
    order: 8,
    accent: "teal",
  },
] as const satisfies readonly SelectedWork[];
