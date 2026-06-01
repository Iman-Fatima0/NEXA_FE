import { parseWebsiteSections, type PublicSitePageLink, type WebsiteSectionBlock } from "./website-sections";

export type PublicSitePage = {
  key: string;
  name: string;
};

export function listPublicSitePages(sections: unknown): PublicSitePage[] {
  const { blocks } = parseWebsiteSections(sections);
  return blocks.map((b: WebsiteSectionBlock) => ({ key: b.key, name: b.name }));
}

export function buildPublicPageLinks(slug: string, sections: unknown, basePath = "/s"): PublicSitePageLink[] {
  const pages = listPublicSitePages(sections);
  const prefix = `${basePath}/${encodeURIComponent(slug)}`;
  return [
    { key: "_home", name: "Home", href: prefix },
    ...pages.map((p) => ({
      key: p.key,
      name: p.name,
      href: `${prefix}/${encodeURIComponent(p.key)}`,
    })),
  ];
}
