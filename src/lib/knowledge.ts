import { getCollection, render } from "astro:content";
import type { MarkdownHeading } from "astro";
import type {
  KnowledgeCorpus as Knowledge,
  KnowledgePassage as Passage,
} from "./ask-types";
import { withBase } from "./paths";
export type { Knowledge, Passage };

// This module deliberately reads only the two public content collections.
// Do not broaden this to a repository glob, resume import, or GitHub fetch.
function plainText(markdown: string): string {
  return markdown
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/```[^\n]*\n[\s\S]*?```/g, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/(?:\*\*|__|`)/g, "")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sections(body: string, headings: MarkdownHeading[]) {
  const matches = [...body.matchAll(/^#{1,6}\s+(.+)\s*$/gm)];
  return matches.map((match, index) => {
    // Astro supplies the exact slug used in the rendered case study, including
    // punctuation handling and duplicate-heading suffixes.
    const heading = headings[index];
    if (!heading) throw new Error("Public content heading metadata is missing");
    const start = match.index! + match[0].length;
    const end = matches[index + 1]?.index ?? body.length;
    return { heading, text: plainText(body.slice(start, end)) };
  });
}

export async function getKnowledge(): Promise<Knowledge> {
  const [pages, projects] = await Promise.all([
    getCollection("pages"),
    getCollection("projects"),
  ]);
  const passages: Passage[] = [];
  const home = pages.find((page) => page.id === "home");
  const about = pages.find((page) => page.id === "about");
  const experience = pages.find((page) => page.id === "experience");
  if (!home || !about || !experience) {
    throw new Error("The public portfolio pages are incomplete");
  }

  passages.push({
    id: "page/home/intro",
    title: "Anant Kumar Srivastava: software engineer and founder",
    text: [home.data.name, home.data.intro, home.data.focus]
      .filter(Boolean)
      .join("\n\n"),
    context: "Public professional introduction",
    url: withBase("#hero-heading"),
  });
  passages.push({
    id: "page/home/contact",
    title: "Opportunities and public contact",
    text: [
      plainText(home.body ?? ""),
      home.data.email ? `Email: ${home.data.email}` : "",
      home.data.linkedin ? `LinkedIn: ${home.data.linkedin}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    context: "Public professional contact and desired roles",
    url: withBase("#contact"),
  });
  passages.push({
    id: "page/about",
    title: "About Anant: education and music",
    text: plainText(about.body ?? ""),
    context: "Public biography, BITS Pilani education, keyboard and composition",
    url: withBase("#about"),
  });

  for (const role of experience.data.roles ?? []) {
    const slug = role.company.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    passages.push({
      id: `experience/${slug}`,
      title: `${role.company}: ${role.role}`,
      text: [
        `${role.company}. ${role.role}. ${role.dates}.`,
        ...role.points.map((point) => `- ${point}`),
      ].join("\n\n"),
      context: `Employer work. ${role.company}. ${role.role}. ${role.dates}.`,
      url: withBase("#experience"),
    });
  }

  for (const project of projects.sort((a, b) => a.data.order - b.data.order)) {
    const { headings } = await render(project);
    const context = `${project.data.title}. ${project.data.role}. Technologies: ${project.data.stack.join(", ")}.`;
    const url = withBase(`projects/${project.id}/`);
    passages.push({
      id: `project/${project.id}/overview`,
      title: project.data.title,
      text: `${project.data.summary}\n\nRole: ${project.data.role}.\nTechnologies: ${project.data.stack.join(", ")}.`,
      context,
      url,
    });
    for (const section of sections(project.body ?? "", headings)) {
      if (!section.text) continue;
      passages.push({
        id: `project/${project.id}/${section.heading.slug}`,
        title: `${project.data.title}: ${section.heading.text}`,
        text: section.text,
        context,
        url: `${url}#${section.heading.slug}`,
      });
    }
  }

  if (new Set(passages.map((passage) => passage.id)).size !== passages.length) {
    throw new Error("Public knowledge passage IDs must be unique");
  }
  return {
    version: 1,
    passages: passages.map((passage) => ({
      ...passage,
      context: `${home.data.name ?? "Portfolio author"}. ${passage.context}`,
    })),
  };
}
