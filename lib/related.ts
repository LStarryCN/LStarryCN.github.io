import type { PostMeta } from "@/types/content";

export function getRelatedPosts(current: PostMeta, posts: PostMeta[], limit = 3) {
  const tags = new Set(current.tags);
  return posts.flatMap((post) => {
    if (post.slug === current.slug) return [];
    const score = post.tags.filter((tag) => tags.has(tag)).length * 3
      + (current.subcategory && post.subcategory === current.subcategory ? 2 : 0)
      + (post.category === current.category ? 1 : 0);
    return score >= 2 ? [{ post, score }] : [];
  }).sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date) || a.post.slug.localeCompare(b.post.slug))
    .slice(0, limit).map(({ post }) => post);
}
