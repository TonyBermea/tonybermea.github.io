import type { ImageMetadata } from "astro";

export type Accent =
  | "vermilion"
  | "yellow"
  | "blue"
  | "orange"
  | "green"
  | "violet"
  | "pink"
  | "teal";

export const ACCENTS = [
  "vermilion",
  "yellow",
  "blue",
  "orange",
  "green",
  "violet",
  "pink",
  "teal",
] as const satisfies readonly Accent[];

export const ACCENT_COLORS: Readonly<Record<Accent, string>> = {
  vermilion: "#e84420",
  yellow: "#f4cd00",
  blue: "#3e58e2",
  orange: "#f1892a",
  green: "#22a722",
  violet: "#7f3cac",
  pink: "#f391c7",
  teal: "#3dc1a2",
};

export type SelectedWork =
  | {
      kind: "case-study";
      slug: string;
      order: number;
      accent: Accent;
    }
  | {
      kind: "external";
      id: string;
      title: string;
      period?: string;
      description: string;
      href: string;
      order: number;
      accent: Accent;
      status?: "decommissioned";
      newTab?: boolean;
    };

export interface CaseStudyFrontmatter {
  title: string;
  period: string;
  projectType: string;
  deck: string;
  cardDescription: string;
  seoDescription: string;
  accent: Accent;
  hero: ImageMetadata;
  heroAlt: string;
  heroCaption: string;
  socialImage: ImageMetadata;
  liveUrl?: string;
  liveLabel?: string;
  draft?: boolean;
}

export interface CollectionEntryLike {
  id?: string;
  slug?: string;
  data: unknown;
}

export type ResolvedSelectedWork =
  | (Extract<SelectedWork, { kind: "external" }> & {
      newTab: boolean;
    })
  | (Extract<SelectedWork, { kind: "case-study" }> & {
      title: string;
      period: string;
      description: string;
      href: `/work/${string}/`;
      newTab: false;
      frontmatter: CaseStudyFrontmatter;
    });

const ACCENT_SET = new Set<string>(ACCENTS);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function requireString(
  object: Record<string, unknown>,
  key: string,
  context: string,
): string {
  const value = object[key];

  if (!nonEmptyString(value)) {
    throw new Error(`${context} is missing non-empty ${key}`);
  }

  return value.trim();
}

function requireAccent(value: unknown, context: string): Accent {
  if (typeof value !== "string" || !ACCENT_SET.has(value)) {
    throw new Error(`${context} has invalid accent: ${String(value)}`);
  }

  return value as Accent;
}

function requireOrder(value: unknown, context: string): number {
  if (!Number.isInteger(value) || (value as number) < 1) {
    throw new Error(`${context} has invalid order: ${String(value)}`);
  }

  return value as number;
}

function requireImageMetadata(
  value: unknown,
  key: "hero" | "socialImage",
  context: string,
): ImageMetadata {
  if (!isRecord(value)) {
    throw new Error(`${context} is missing ${key} image metadata`);
  }

  if (
    !nonEmptyString(value.src) ||
    typeof value.width !== "number" ||
    value.width <= 0 ||
    typeof value.height !== "number" ||
    value.height <= 0 ||
    !nonEmptyString(value.format)
  ) {
    throw new Error(`${context} has incomplete ${key} image metadata`);
  }

  return value as unknown as ImageMetadata;
}

function isSafeHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      url.hostname.length > 0
    );
  } catch {
    return false;
  }
}

export function validateSelectedWork(
  input: readonly unknown[],
): asserts input is readonly SelectedWork[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error("Selected work must be a non-empty array");
  }

  const orders = new Set<number>();
  const externalIds = new Set<string>();
  const caseStudySlugs = new Set<string>();

  input.forEach((value, index) => {
    const context = `Selected work item ${index + 1}`;

    if (!isRecord(value)) {
      throw new Error(`${context} must be an object`);
    }

    const order = requireOrder(value.order, context);
    requireAccent(value.accent, context);

    if (orders.has(order)) {
      throw new Error(`Selected work has duplicate order: ${order}`);
    }
    orders.add(order);

    if (value.kind === "case-study") {
      const slug = requireString(value, "slug", context);

      if (!SLUG_PATTERN.test(slug)) {
        throw new Error(`${context} has invalid case-study slug: ${slug}`);
      }
      if (caseStudySlugs.has(slug)) {
        throw new Error(`Selected work has duplicate case-study slug: ${slug}`);
      }
      caseStudySlugs.add(slug);
      return;
    }

    if (value.kind !== "external") {
      throw new Error(`${context} has invalid kind: ${String(value.kind)}`);
    }

    const id = requireString(value, "id", context);
    requireString(value, "title", context);
    requireString(value, "description", context);
    const href = requireString(value, "href", context);

    if (externalIds.has(id)) {
      throw new Error(`Selected work has duplicate external id: ${id}`);
    }
    externalIds.add(id);

    if (value.period !== undefined && !nonEmptyString(value.period)) {
      throw new Error(`${context} has invalid period`);
    }
    if (value.status !== undefined && value.status !== "decommissioned") {
      throw new Error(`${context} has invalid status`);
    }
    if (value.newTab !== undefined && typeof value.newTab !== "boolean") {
      throw new Error(`${context} has invalid newTab flag`);
    }
    if (!isSafeHttpsUrl(href)) {
      throw new Error(`${context} has unsafe external href: ${href}`);
    }
  });
}

export function validateCaseStudyFrontmatter(
  value: unknown,
  context = "Case-study frontmatter",
): CaseStudyFrontmatter {
  if (!isRecord(value)) {
    throw new Error(`${context} must be an object`);
  }

  const title = requireString(value, "title", context);
  const period = requireString(value, "period", context);
  const projectType = requireString(value, "projectType", context);
  const deck = requireString(value, "deck", context);
  const cardDescription = requireString(value, "cardDescription", context);
  const seoDescription = requireString(value, "seoDescription", context);
  const accent = requireAccent(value.accent, context);
  const hero = requireImageMetadata(value.hero, "hero", context);
  const heroAlt = requireString(value, "heroAlt", context);
  const heroCaption = requireString(value, "heroCaption", context);
  const socialImage = requireImageMetadata(value.socialImage, "socialImage", context);

  if (value.liveUrl !== undefined && (!nonEmptyString(value.liveUrl) || !isSafeHttpsUrl(value.liveUrl))) {
    throw new Error(`${context} has unsafe liveUrl: ${String(value.liveUrl)}`);
  }

  if (value.liveLabel !== undefined && !nonEmptyString(value.liveLabel)) {
    throw new Error(`${context} has invalid liveLabel`);
  }

  if (value.liveLabel !== undefined && value.liveUrl === undefined) {
    throw new Error(`${context} has liveLabel without liveUrl`);
  }

  if (value.draft !== undefined && typeof value.draft !== "boolean") {
    throw new Error(`${context} has invalid draft flag`);
  }

  return {
    title,
    period,
    projectType,
    deck,
    cardDescription,
    seoDescription,
    accent,
    hero,
    heroAlt,
    heroCaption,
    socialImage,
    ...(value.liveUrl === undefined ? {} : { liveUrl: value.liveUrl.trim() }),
    ...(value.liveLabel === undefined ? {} : { liveLabel: value.liveLabel.trim() }),
    ...(value.draft === undefined ? {} : { draft: value.draft }),
  };
}

function collectionSlug(entry: CollectionEntryLike, index: number): string {
  const rawId = nonEmptyString(entry.id)
    ? entry.id
    : nonEmptyString(entry.slug)
      ? entry.slug
      : "";
  const slug = rawId.replace(/\.(md|mdx)$/i, "");

  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`Work collection entry ${index + 1} has invalid id/slug: ${rawId}`);
  }

  return slug;
}

export function resolveSelectedWork(
  items: readonly SelectedWork[],
  collection: readonly CollectionEntryLike[],
): ResolvedSelectedWork[] {
  validateSelectedWork(items);

  const entriesBySlug = new Map<string, CaseStudyFrontmatter>();
  const collectionSlugs = new Set<string>();

  collection.forEach((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`Work collection entry ${index + 1} must be an object`);
    }

    const slug = collectionSlug(entry, index);
    if (collectionSlugs.has(slug)) {
      throw new Error(`Work collection has duplicate id/slug: ${slug}`);
    }
    collectionSlugs.add(slug);

    const frontmatter = validateCaseStudyFrontmatter(
      entry.data,
      `Work collection entry "${slug}"`,
    );

    if (frontmatter.draft !== true) {
      entriesBySlug.set(slug, frontmatter);
    }
  });

  return [...items]
    .sort((a, b) => a.order - b.order)
    .map((item): ResolvedSelectedWork => {
      if (item.kind === "external") {
        return {
          ...item,
          newTab: item.newTab ?? false,
        };
      }

      const frontmatter = entriesBySlug.get(item.slug);
      if (!frontmatter) {
        throw new Error(
          `Selected case-study slug "${item.slug}" is missing, invalid, or draft`,
        );
      }
      if (frontmatter.accent !== item.accent) {
        throw new Error(
          `Selected case study "${item.slug}" has accent ${item.accent}, but its frontmatter uses ${frontmatter.accent}`,
        );
      }

      return {
        ...item,
        title: frontmatter.title,
        period: frontmatter.period,
        description: frontmatter.cardDescription,
        href: `/work/${item.slug}/` as `/work/${string}/`,
        newTab: false,
        frontmatter,
      };
    });
}
