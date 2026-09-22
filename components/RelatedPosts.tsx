import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { postHref } from "@/lib/format";
import type { PostMeta } from "@/types/content";

export function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  if (!posts.length) return null;
  return <section className="related-posts" aria-labelledby="related-title">
    <div className="reading-section-heading"><span>RELATED</span><h2 id="related-title">相关内容</h2></div>
    <div className="related-list">{posts.map((post, index) =>
      <Link href={postHref(post.slug)} key={post.slug}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{post.title}</strong>
        <small>{post.subcategory || post.category}{post.tags.length ? ` · ${post.tags.slice(0, 2).join(" · ")}` : ""}</small>
        <ArrowUpRight size={17} aria-hidden="true" />
      </Link>)}</div>
  </section>;
}
