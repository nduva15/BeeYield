import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  canonical?: string;
  schema?: object;
  type?: string;
}

const DEFAULT_DESCRIPTION =
  "BeeYield - Your Partner in Pollination. Premium precision pollination services, sustainable beekeeping, and traceable raw honey from Kenya to the World.";
const DEFAULT_KEYWORDS =
  "precision pollination, honey traceability, sustainable beekeeping, Kibwezi, Makueni, Kenya honey, African agriculture, IoT bees";

function upsertMeta(selector: string, attributes: Record<string, string>) {
  if (typeof document === "undefined") return;

  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  if (typeof document === "undefined") return;

  let element = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = "/logo.png",
  url,
  canonical,
  schema,
  type = "website",
}: SEOProps) => {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const siteUrl = window.location.origin || "https://beeyield.com";
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    const fullImage = image.startsWith("http") ? image : `${siteUrl}${image}`;
    const canonicalUrl = canonical || fullUrl;

    document.title = `${title} | BeeYield - Your Partner in Pollination`;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="keywords"]', { name: "keywords", content: keywords });
    upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });

    upsertMeta('meta[name="geo.region"]', { name: "geo.region", content: "KE" });
    upsertMeta('meta[name="geo.placename"]', { name: "geo.placename", content: "Kibwezi, Makueni County, Kenya" });
    upsertMeta('meta[name="geo.position"]', { name: "geo.position", content: "-2.4214;37.9545" });
    upsertMeta('meta[name="ICBM"]', { name: "ICBM", content: "-2.4214, 37.9545" });

    upsertMeta('meta[name="search-engine"]', { name: "search-engine", content: "beeyield-aeo" });
    upsertMeta('meta[name="audience"]', { name: "audience", content: "farmers, apiarists, sustainable consumers, global researchers" });

    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: fullUrl });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: `${title} | BeeYield` });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: fullImage });
    upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: "en_KE" });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "BeeYield" });

    upsertMeta('meta[property="twitter:card"]', { property: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[property="twitter:url"]', { property: "twitter:url", content: fullUrl });
    upsertMeta('meta[property="twitter:title"]', { property: "twitter:title", content: `${title} | BeeYield` });
    upsertMeta('meta[property="twitter:description"]', { property: "twitter:description", content: description });
    upsertMeta('meta[property="twitter:image"]', { property: "twitter:image", content: fullImage });
    upsertMeta('meta[name="twitter:label1"]', { name: "twitter:label1", content: "Region" });
    upsertMeta('meta[name="twitter:data1"]', { name: "twitter:data1", content: "Kenya, Africa" });
    upsertMeta('meta[name="twitter:label2"]', { name: "twitter:label2", content: "Expertise" });
    upsertMeta('meta[name="twitter:data2"]', { name: "twitter:data2", content: "Precision Pollination & IoT IoT" });

    const schemaId = "beeyield-seo-schema";
    const existingSchema = document.getElementById(schemaId);
    if (existingSchema) existingSchema.remove();

    if (schema) {
      const script = document.createElement("script");
      script.id = schemaId;
      script.type = "application/ld+json";
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [canonical, description, image, keywords, schema, title, type, url]);

  return null;
};

export default SEO;
