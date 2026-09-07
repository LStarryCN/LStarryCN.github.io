import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Folder,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark-dimmed.css";
import { CodeCopy } from "@/components/CodeCopy";
import { PostToc } from "@/components/PostToc";
import { formatDate, postHref } from "@/lib/format";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/siteConfig";

const mono = localFont({
  src: "../../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-mono",
  display: "swap",
  weight: "100 800",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: [post.category, post.subcategory || "", ...post.tags].filter(Boolean),
    alternates: { canonical: postHref(post.slug) },
    openGraph: {
      type: "article",
      url: `${siteConfig.url}${postHref(post.slug)}`,
      title: post.title,
      description: post.description,
      publishedTime: `${post.date}T00:00:00+08:00`,
      modifiedTime: post.updated ? `${post.updated}T00:00:00+08:00` : undefined,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const posts = getAllPosts();
  const index = posts.findIndex((item) => item.slug === post.slug);
  const newer = index > 0 ? posts[index - 1] : undefined;
  const older = index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined;

  return (
    <div className={`page-shell article-page ${mono.variable}`}>
      <article className="article-main glass-card">
        <header className="article-header">
          <div className="article-category"><Folder size={15} /> {post.category}{post.subcategory ? ` / ${post.subcategory}` : ""}</div>
          <h1>{post.title}</h1>
          <p>{post.description}</p>
          <div className="article-meta">
            <span><CalendarDays size={15} /> {formatDate(post.date)}</span>
            <span><Clock3 size={15} /> 约 {post.readingTime} 分钟</span>
          </div>
          {post.tags.length ? <div className="tag-row article-tags"><Tag size={15} />{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div> : null}
        </header>
        <div className="article-divider" />
        <div className="article-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        <CodeCopy />
        <nav className="post-pagination" aria-label="上一篇与下一篇">
          {older ? <Link href={postHref(older.slug)}><ArrowLeft size={18} /><span><small>上一篇</small><strong>{older.title}</strong></span></Link> : <span />}
          {newer ? <Link className="next-post" href={postHref(newer.slug)}><span><small>下一篇</small><strong>{newer.title}</strong></span><ArrowRight size={18} /></Link> : <span />}
        </nav>
      </article>
      <PostToc toc={post.toc} />
    </div>
  );
}
