export interface SiteLink {
  readonly label: string;
  readonly href: string;
}

export interface SiteIdentity {
  readonly name: string;
  readonly displayName: string;
  readonly title: string;
  readonly description: string;
  readonly biography: string;
  readonly email: string;
  readonly links: readonly SiteLink[];
}

export const siteIdentity = {
  name: "Tony Bermea",
  displayName: "tony bermea",
  title: "Tony Bermea — experience engineer and software consultant",
  description:
    "Tony Bermea is an experience engineer and software consultant in Kansai, Japan, working across interface design, web engineering, and cloud delivery.",
  biography:
    "I’m an experience engineer and software consultant based in Kansai, Japan. I design and build human-centered digital products for brands, creative studios, and complex operational workflows—working across interface design, web engineering, and cloud delivery.",
  email: "hello@tonybermea.dev",
  links: [
    { label: "behance", href: "https://www.behance.net/tbdev" },
    { label: "github", href: "https://github.com/TonyBermea" },
    { label: "linkedin", href: "https://www.linkedin.com/in/tony-bermea/" },
  ],
} as const satisfies SiteIdentity;
