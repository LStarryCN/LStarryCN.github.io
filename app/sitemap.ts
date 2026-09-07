import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { topics } from "@/lib/topics";
import { siteConfig } from "@/siteConfig";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = ["", "/posts/", "/projects/", "/about/"];
  return [
    ...staticPages.map((path) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" as const : "monthly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...topics.map((topic) => ({
      url: `${siteConfig.url}/topics/${topic.segments.join("/")}/`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getAllPosts().map((post) => ({
      url: `${siteConfig.url}${postHref(post.slug)}`,
      lastModified: new Date(`${post.updated || post.date}T00:00:00+08:00`),
      changeFrequency: "yearly" as const,
      priority: 0.75,
    })),
  ];
}

function postHref(slug: string) {
  return `/posts/${slug}/`;
}
