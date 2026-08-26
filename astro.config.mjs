import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";

const [repositoryOwner, repositoryName] = (
  process.env.GITHUB_REPOSITORY ?? "TonyBermea/"
).split("/");

const pagesOwner = repositoryOwner || "TonyBermea";

function validSiteUrl(value) {
  const candidate = value?.trim();

  if (!candidate) {
    return undefined;
  }

  try {
    const url = new URL(candidate);

    if (url.protocol !== "https:") {
      return undefined;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

const customSite = validSiteUrl(process.env.SITE_URL);
const isGitHubBuild = process.env.GITHUB_ACTIONS === "true";

const isUserSite =
  repositoryName?.toLowerCase() ===
  `${pagesOwner.toLowerCase()}.github.io`;

const githubProjectBase =
  isGitHubBuild && !customSite && repositoryName && !isUserSite
    ? `/${repositoryName}`
    : undefined;

export default defineConfig({
  site: customSite ?? `https://${pagesOwner.toLowerCase()}.github.io`,
  ...(githubProjectBase ? { base: githubProjectBase } : {}),
  integrations: [mdx(), preact()],
  outDir: "./dist/",
  trailingSlash: "always",
  build: {
    inlineStylesheets: "always",
  },
  server: {
    host: true,
    allowedHosts: ["terminal.local"],
  },
});
