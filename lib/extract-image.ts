export function extractImage(item: any): string | null {
  return (
    item.mediaContent?.["$"]?.url ||
    item["media:content"]?.["$"]?.url ||
    item.mediaThumbnail?.["$"]?.url ||
    item["media:thumbnail"]?.["$"]?.url ||
    item.enclosure?.url ||
    item["enclosure"]?.url ||
    (typeof item.enclosure === "string" ? item.enclosure : null) ||
    (typeof item["enclosure"] === "string" ? item["enclosure"] : null) ||
    item["itunes:image"]?.["$"]?.href ||
    extractOgFromDescription(item.content || item["content:encoded"] || item.description || "") ||
    null
  );
}

function extractOgFromDescription(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}
