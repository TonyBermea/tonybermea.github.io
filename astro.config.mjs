import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";

const [repositoryOwner, repositoryName] = (process.env.GITHUB_REPOSITORY ?? "TonyBermea/").split("/");
const pagesOwner = repositoryOwner || "TonyBermea";
const customSite = process.env.SITE_URL?.replace(/\/$/, "");
const isGitHubBuild = process.env.GITHUB_ACTIONS === "true";
const isUserSite = repositoryName?.toLowerCase() === `${pagesOwner.toLowerCase()}.github.io`;
const githubProjectBase =
  isGitHubBuild && !customSite && repositoryName && !isUserSite
    ? `/${repositoryName}`
    : undefined;

export default defineConfig({
  site: customSite ?? `https://${pagesOwner.toLowerCase()}.github.io`,
  ...(githubProjectBase ? { base: githubProjectBase } : {}),
  integrations: [mdx(), preact()],
  outDir: "./dist/client/",
  trailingSlash: "always",
  build: {
    inlineStylesheets: "always",
  },
  server: {
    host: true,
    allowedHosts: ["terminal.local"],
  },
});
