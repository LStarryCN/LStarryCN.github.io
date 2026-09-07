import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { PostsExplorer } from "@/components/PostsExplorer";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "文章",
  description: "浏览 LStarry 的全部技术文章、学习笔记与随笔。",
  alternates: { canonical: "/posts/" },
};

export default function PostsPage() {
  const posts = getAllPosts();
  return (
    <div className="page-shell inner-page">
      <header className="page-hero glass-card">
        <span className="page-icon"><FileText size={25} /></span>
        <div><span className="section-kicker">文章归档</span><h1>全部文章</h1><p>按标题、内容方向或标签，找到值得再次打开的记录。</p></div>
        <strong className="hero-count">{posts.length}<small>篇文章</small></strong>
      </header>
      <PostsExplorer posts={posts} />
    </div>
  );
}
