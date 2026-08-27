export const SITE_URL = "https://techindiagrams.cloud";
export const SITE_NAME = "Tech in Diagrams";
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const canonical = (path = "/") => `${SITE_URL}${path === "/" ? "" : path}`;

/** Shared social meta for a route. */
export const socialMeta = ({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: string;
}) => [
  { property: "og:title", content: title },
  { property: "og:description", content: description },
  { property: "og:url", content: canonical(path) },
  { property: "og:type", content: type },
  { property: "og:image", content: OG_IMAGE },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:alt", content: "Tech in Diagrams — Understand IT, one diagram at a time." },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: title },
  { name: "twitter:description", content: description },
  { name: "twitter:image", content: OG_IMAGE },
];
