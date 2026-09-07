import { ArrowUpRight, CalendarDays, Clock3, FileText } from "lucide-react";
import Link from "next/link";
import { formatDate, postHref } from "@/lib/format";
import type { PostMeta } from "@/types/content";

export function PostCard({ post, featured = false }: { post: PostMeta; featured?: boolean }) {
  return (
    <article className={featured ? "post-card featured-post-card" : "post-card"}>
      <Link className="post-cover" href={postHref(post.slug)} aria-label={`阅读：${post.title}`}>
        {post.cover ? <img src={post.cover} alt="" /> : (
          <span className="cover-placeholder"><FileText size={featured ? 38 : 30} /></span>
        )}
        <span className="post-category">{post.subcategory || post.category}</span>
      </Link>
      <div className="post-card-body">
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
