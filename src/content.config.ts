import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    label: z.string(),
    summary: z.string(),
    role: z.string(),
    category: z.string(),
    stack: z.array(z.string()),
    order: z.number(),
    featured: z.boolean(),
    visual: z.enum(["trlr", "codeforces", "nielsen", "portfolio"]),
    evidence: z.string(),
    highlights: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .default([]),
    links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
  }),
});
const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    name: z.string().optional(),
    headline: z.string().optional(),
    headlineAccent: z.string().optional(),
    intro: z.string().optional(),
    focus: z.string().optional(),
    email: z.email().optional(),
    linkedin: z.url().optional(),
    github: z.url().optional(),
    roles: z
      .array(
        z.object({
          company: z.string(),
          role: z.string(),
          dates: z.string(),
          focus: z.string(),
          points: z.array(z.string()),
        }),
      )
      .optional(),
  }),
});
export const collections = { projects, pages };
