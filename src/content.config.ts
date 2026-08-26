import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const accents = [
  "vermilion",
  "yellow",
  "blue",
  "orange",
  "green",
  "violet",
  "pink",
  "teal",
] as const;

const work = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/data/work" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      period: z.string().min(1),
      projectType: z.string().min(1),
      deck: z.string().min(1),
      cardDescription: z.string().min(1),
      seoDescription: z.string().min(1),
      accent: z.enum(accents),
      hero: image(),
      heroAlt: z.string().min(1),
      heroCaption: z.string().min(1),
      socialImage: image(),
      liveUrl: z.url().refine((value) => value.startsWith("https://"), {
        message: "liveUrl must use HTTPS",
      }).optional(),
      liveLabel: z.string().min(1).optional(),
      draft: z.boolean().default(false),
    }).superRefine((data, context) => {
      if (data.liveLabel && !data.liveUrl) {
        context.addIssue({
          code: "custom",
          path: ["liveLabel"],
          message: "liveLabel requires liveUrl",
        });
      }
    }),
});

export const collections = { work };
