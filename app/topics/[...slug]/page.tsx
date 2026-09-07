import type { Metadata } from "next";
import { FolderTree } from "lucide-react";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { getPostsByCategory } from "@/lib/posts";
import { getTopic, topics } from "@/lib/topics";

export const dynamicParams = false;

export function generateStaticParams() {
  return topics.map((topic) => ({ slug: topic.segments }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return {};
  return {
    title: topic.title,
    description: topic.description,
    alternates: { canonical: `/topics/${slug.join("/")}/` },
  };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();
  const posts = getPostsByCategory(topic.category, topic.subcategory);

  return (
    <div className="page-shell inner-page">
      <header className="page-hero glass-card topic-hero">
        <span className="page-icon"><FolderTree size={25} /></span>
        <div><span className="section-kicker">分类</span><h1>{topic.title}</h1><p>{topic.description}</p></div>
        <strong className="hero-count">{posts.length}<small>篇文章</small></strong>
      </header>
      {posts.length ? (
        <section className="posts-grid">{posts.map((post) => <PostCard post={post} key={post.slug} />)}</section>
      ) : (
        <EmptyState
          title={`${topic.title} · 0 篇文章`}
          description="分类入口已经准备好，等真实笔记完成后会在这里出现。"
        />
      )}
    </div>
  );
}
