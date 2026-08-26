import { describe, expect, it } from "vitest";

import { selectedWork } from "../src/data/selected-work";
import {
  ACCENTS,
  resolveSelectedWork,
  validateCaseStudyFrontmatter,
  validateSelectedWork,
  type SelectedWork,
} from "../src/lib/work";

const image = {
  src: "/_astro/field-index.test.jpg",
  width: 1200,
  height: 800,
  format: "jpg",
};

const frontmatter = {
  title: "Field Index",
  period: "Spring 2027",
  projectType: "upcoming public data product",
  deck: "A public map for exploring local environmental observations.",
  cardDescription: "An upcoming public map for reading environmental observations in context.",
  seoDescription: "An upcoming public environmental-data explorer with a planned Spring 2027 preview.",
  accent: "vermilion",
  hero: image,
  heroAlt: "Field Index prototype map interface.",
  heroCaption: "An early browser view with a public preview planned for Spring 2027.",
  socialImage: image,
  draft: false,
} as const;

describe("selected work", () => {
  it("contains eight stable entries and uses every accent exactly once", () => {
    expect(() => validateSelectedWork(selectedWork)).not.toThrow();
    expect(selectedWork).toHaveLength(8);
    expect(selectedWork.map((item) => item.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(new Set(selectedWork.map((item) => item.accent))).toEqual(new Set(ACCENTS));
  });

  it("contains six internal studies and two external projects in the required order", () => {
    const internal = selectedWork.filter((item) => item.kind === "case-study");
    const external = selectedWork.filter((item) => item.kind === "external");

    expect(internal.map((item) => item.slug)).toEqual([
      "field-index",
      "coffee-cupping",
      "gumo-supplies",
      "lineage",
      "npkn-studio",
      "mchns",
    ]);
    expect(external.map((item) => item.id)).toEqual(["soul-mag", "pixel-vault"]);
    for (const item of external) {
      expect(item.newTab).toBe(true);
      expect(new URL(item.href).protocol).toBe("https:");
    }
    expect(external[1]).toMatchObject({ period: "2023", status: "decommissioned" });
  });
});

describe("selected work validation", () => {
  it("rejects duplicate external ids, case-study slugs, and orders", () => {
    const external = selectedWork[6];
    const caseStudy = selectedWork[0];

    expect(() => validateSelectedWork([external, { ...external, order: 20 }])).toThrow(
      /duplicate external id/i,
    );
    expect(() =>
      validateSelectedWork([caseStudy, { ...caseStudy, order: 20 }]),
    ).toThrow(/duplicate case-study slug/i);
    expect(() => validateSelectedWork([caseStudy, { ...external, order: 1 }])).toThrow(
      /duplicate order/i,
    );
  });

  it("rejects invalid accents, incomplete records, status values, and unsafe hrefs", () => {
    const external = selectedWork[6];

    expect(() =>
      validateSelectedWork([{ ...external, accent: "ultraviolet" }]),
    ).toThrow(/invalid accent/i);
    expect(() =>
      validateSelectedWork([{ ...external, description: "" }]),
    ).toThrow(/missing non-empty description/i);
    expect(() =>
      validateSelectedWork([{ ...external, status: "archived" }]),
    ).toThrow(/invalid status/i);
    expect(() =>
      validateSelectedWork([{ ...external, href: "http://portfolio.invalid/room-tone" }]),
    ).toThrow(/unsafe external href/i);
  });
});

describe("case-study collection resolution", () => {
  it("resolves internal cards from collection metadata and sorts by order", () => {
    const work: SelectedWork[] = [selectedWork[6], selectedWork[0]];
    const resolved = resolveSelectedWork(work, [
      { id: "field-index.mdx", data: frontmatter },
    ]);

    expect(resolved.map((item) => item.order)).toEqual([1, 7]);
    expect(resolved[0]).toMatchObject({
      kind: "case-study",
      title: "Field Index",
      href: "/work/field-index/",
      description: frontmatter.cardDescription,
      newTab: false,
    });
  });

  it("fails missing, draft, duplicate, mismatched, and incomplete collection entries", () => {
    expect(() => resolveSelectedWork([selectedWork[0]], [])).toThrow(/missing, invalid, or draft/i);
    expect(() =>
      resolveSelectedWork([selectedWork[0]], [
        { id: "field-index", data: { ...frontmatter, draft: true } },
      ]),
    ).toThrow(/missing, invalid, or draft/i);
    expect(() =>
      resolveSelectedWork([selectedWork[0]], [
        { id: "field-index", data: frontmatter },
        { id: "field-index.mdx", data: frontmatter },
      ]),
    ).toThrow(/duplicate id\/slug/i);
    expect(() =>
      resolveSelectedWork([selectedWork[0]], [
        { id: "field-index", data: { ...frontmatter, draft: true } },
        { id: "field-index.mdx", data: frontmatter },
      ]),
    ).toThrow(/duplicate id\/slug/i);
    expect(() =>
      resolveSelectedWork([selectedWork[0]], [
        { id: "field-index", data: { ...frontmatter, accent: "blue" } },
      ]),
    ).toThrow(/frontmatter uses blue/i);
    expect(() =>
      resolveSelectedWork([selectedWork[0]], [
        { id: "field-index", data: { ...frontmatter, seoDescription: "" } },
      ]),
    ).toThrow(/missing non-empty seoDescription/i);
  });

  it("validates intrinsic image metadata", () => {
    expect(() => validateCaseStudyFrontmatter(frontmatter)).not.toThrow();
    expect(() =>
      validateCaseStudyFrontmatter({
        ...frontmatter,
        hero: { ...image, width: 0 },
      }),
    ).toThrow(/incomplete hero image metadata/i);
  });

  it("rejects unsafe live project URLs", () => {
    expect(() =>
      validateCaseStudyFrontmatter({
        ...frontmatter,
        liveUrl: "http://example.com/field-index",
      }),
    ).toThrow(/unsafe liveUrl/i);
  });

  it("allows a custom live label only when a safe live URL is present", () => {
    expect(() =>
      validateCaseStudyFrontmatter({
        ...frontmatter,
        liveUrl: "https://www.behance.net/gallery/example",
        liveLabel: "view project on Behance ↗︎",
      }),
    ).not.toThrow();
    expect(() =>
      validateCaseStudyFrontmatter({
        ...frontmatter,
        liveLabel: "view project on Behance ↗︎",
      }),
    ).toThrow(/liveLabel without liveUrl/i);
  });
});
