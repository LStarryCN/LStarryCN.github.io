import { ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";
import { formatDate, postHref } from "@/lib/format";
import type { PostMeta } from "@/types/content";

export function PostCard({ post, featured = false }: { post: PostMeta; featured?: boolean }) {
  const cardClassName = [
    "post-card",
    featured ? "featured-post-card" : "",
    post.cover ? "" : "post-card-no-cover",
  ].filter(Boolean).join(" ");

  return (
    <article className={cardClassName}>
      {post.cover ? (
        <Link className="post-cover" href={postHref(post.slug)} aria-label={`阅读：${post.title}`}>
          <img src={post.cover} alt="" />
          <span className="post-category">{post.subcategory || post.category}</span>
        </Link>
      ) : null}
      <div className="post-card-body">
        {!post.cover ? <span className="post-category post-category-inline">{post.subcategory || post.category}</span> : null}
        <div className="post-meta">
          <span><CalendarDays size={14} /> {formatDate(post.date)}</span>
          <span><Clock3 size={14} /> {post.readingTime} 分钟</span>
        </div>
        <h2><Link href={postHref(post.slug)}>{post.title}</Link></h2>
        <p>{post.description}</p>
        <div className="post-card-footer">
          <div className="tag-row">
            {post.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
          </div>
          <Link className="read-link" href={postHref(post.slug)} aria-label={`继续阅读 ${post.title}`}>
            阅读 <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
