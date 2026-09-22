import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { postHref } from "@/lib/format";
import type { Series } from "@/lib/series";
import type { PostMeta } from "@/types/content";

export function SeriesNavigation({ series, current }: { series: Series; current: PostMeta }) {
  const index = series.posts.findIndex((post) => post.slug === current.slug);
  const next = series.posts[index + 1];
  return <section className="series-navigation" aria-labelledby="series-navigation-title">
    <div className="reading-section-heading"><span>IN THIS SERIES</span><h2 id="series-navigation-title"><Link href={`/series/#${series.slug}`}>{series.title}</Link></h2></div>
    <ol>{series.posts.map((post, position) =>
      <li key={post.slug} className={post.slug === current.slug ? "current" : ""}>
        <span>{String(position + 1).padStart(2, "0")}</span>
        {post.slug === current.slug ? <strong aria-current="page">{post.title}<small>当前文章</small></strong>
          : <Link href={postHref(post.slug)}>{post.title}</Link>}
      </li>)}</ol>
    {next ? <Link className="series-next" href={postHref(next.slug)}>
      <span>NEXT IN SERIES <strong>{String(index + 2).padStart(2, "0")} / {next.title}</strong></span><ArrowRight size={19} />
    </Link> : null}
  </section>;
}
