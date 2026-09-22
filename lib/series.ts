import { createHash } from "node:crypto";
import type { PostMeta } from "@/types/content";

export type Series = { slug: string; title: string; posts: PostMeta[] };

export function seriesSlug(post: PostMeta) {
  if (!post.series) return undefined;
  return post.seriesSlug || `series-${createHash("sha256").update(post.series).digest("hex").slice(0, 12)}`;
}

export function getAllSeries(posts: PostMeta[]): Series[] {
  const groups = new Map<string, Series>();
  for (const post of posts) {
    const slug = seriesSlug(post);
    if (!slug || !post.series) continue;
    const group = groups.get(slug);
    if (group && group.title !== post.series) throw new Error(`Series slug collision: ${slug}`);
    if (group) group.posts.push(post);
    else groups.set(slug, { slug, title: post.series, posts: [post] });
  }
  return [...groups.values()].map((group) => ({
    ...group,
    posts: group.posts.sort((a, b) => (a.seriesOrder ?? Infinity) - (b.seriesOrder ?? Infinity)
      || a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug)),
  })).sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
}
