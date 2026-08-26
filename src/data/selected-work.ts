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
    kind: "external",
    id: "soul-mag",
    title: "Soul Mag",
    period: "2024",
    description: "An editorial homepage concept built around expressive hierarchy and a modular story grid.",
    href: "https://silly-faloodeh-0d1ed4.netlify.app/",
    order: 7,
    accent: "pink",
    newTab: true,
  },
  {
    kind: "external",
    id: "pixel-vault",
    title: "Pixel Vault",
    period: "2023",
    status: "decommissioned",
    description: "A gallery-first NFT marketplace prototype that keeps artwork ahead of wallet, minting, and bidding mechanics.",
    href: "https://phenomenal-custard-0bd4af.netlify.app/",
    order: 8,
    accent: "teal",
    newTab: true,
  },
] as const satisfies readonly SelectedWork[];
