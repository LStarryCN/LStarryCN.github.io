import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, ArrowUpRight } from "lucide-react";
import { getAllPosts } from "@/lib/posts";
import { getAllSeries } from "@/lib/series";
import { postHref } from "@/lib/format";

export const metadata: Metadata = {
  title: "专栏",
  description: "按系列持续整理的文章。",
  alternates: { canonical: "/series/" },
};

export default function SeriesPage() {
  const series = getAllSeries(getAllPosts());
  return <div className="page-shell inner-page">
    <header className="page-hero glass-card"><span className="page-icon"><BookOpenText size={25} /></span>
      <div><span className="section-kicker">专栏</span><h1>系列文章</h1><p>沿着同一个问题，持续阅读与整理。</p></div>
      <strong className="hero-count">{series.length}<small>个系列</small></strong>
    </header>
    {series.length ? <div className="series-overview">{series.map((item) =>
      <section id={item.slug} key={item.slug} className="series-overview-section" aria-labelledby={`${item.slug}-title`}>
        <header><span>{String(item.posts.length).padStart(2, "0")} 篇文章</span><h2 id={`${item.slug}-title`}>{item.title}</h2></header>
        <ol>{item.posts.map((post, index) => <li key={post.slug}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <Link href={postHref(post.slug)}><strong>{post.title}</strong><ArrowUpRight size={18} /></Link>
        </li>)}</ol>
      </section>)}</div>
      : <p className="series-empty">专栏会随连续文章发布逐步出现。</p>}
  </div>;
}
