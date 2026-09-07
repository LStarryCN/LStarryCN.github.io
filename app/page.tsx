import {
  ArrowUpRight,
  BookOpenText,
  Code2,
  FolderGit2,
  GitBranch,
  Layers3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { SearchBox } from "@/components/SearchBox";
import { SiteDashboard } from "@/components/SiteDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { projects } from "@/data/projects";
import { getAllPosts, getPostStats } from "@/lib/posts";
import { siteConfig } from "@/siteConfig";

export default function HomePage() {
  const posts = getAllPosts();
  const stats = getPostStats();
  const latest = posts[0];

  return (
    <div className="page-shell home-page">
      <section className="home-intro">
        <p>在星屿里，整理代码与日常。</p>
        <SearchBox posts={posts} />
      </section>

      <section className="bento-grid" aria-label="LStarry 概览">
        <article className="glass-card profile-card bento-span-7">
          <div className="profile-identity">
            <div className="profile-mark"><Sparkles size={34} /></div>
            <div><h2>{siteConfig.name}</h2><p>{siteConfig.role}</p></div>
          </div>
          <p className="profile-description">{siteConfig.description}</p>
          <div className="profile-stats">
            <div><strong>{stats.posts}</strong><span>文章</span></div>
            <div><strong>{stats.categories}</strong><span>分类</span></div>
            <div><strong>{stats.tags}</strong><span>标签</span></div>
            <div><strong>{projects.length}</strong><span>项目</span></div>
          </div>
          <a className="primary-link" href={siteConfig.github} target="_blank" rel="noreferrer">
            <GitBranch size={18} /> GitHub <ArrowUpRight size={16} />
          </a>
        </article>

        <article className="glass-card status-card bento-span-5">
          <div className="status-heading"><div><span className="live-dot" /> 最近在做什么</div></div>
          <h2>保持好奇，持续构建。</h2>
          <div className="status-list">
            {siteConfig.currentStatus.learning.map((item, index) => (
              <div key={item}>
                {index === 0 ? <BookOpenText size={18} /> : index === 1 ? <Code2 size={18} /> : <Sparkles size={18} />}
                <span>{item}</span>
              </div>
            ))}
          </div>
        </article>

        <div className="glass-card motto-card bento-span-12">
          <Sparkles size={18} />
          <strong>{siteConfig.subtitle}</strong>
          <span>把零散的思考，整理成可以再次抵达的路径。</span>
        </div>

        <section className="bento-span-7 latest-card-wrap">
          <div className="bento-section-title"><span><BookOpenText size={17} /> 最新文章</span><Link href="/posts/">全部文章 <ArrowUpRight size={15} /></Link></div>
          {latest ? <PostCard post={latest} featured /> : null}
        </section>

        <div className="bento-span-5 compact-bento">
          <article className="glass-card project-teaser">
            <div className="card-icon"><FolderGit2 size={22} /></div>
            <span>Projects</span>
            <h2>项目</h2>
            <p>{projects.length ? `${projects.length} 个项目正在展示` : "项目记录将在这里出现。"}</p>
            <Link href="/projects/">查看项目 <ArrowUpRight size={16} /></Link>
          </article>
          <div className="compact-row">
            <article className="glass-card learning-teaser">
              <Layers3 size={21} />
              <div><span>最近学习</span><h2>学习笔记</h2></div>
              <Link href="/topics/learning/" aria-label="查看学习分类"><ArrowUpRight size={18} /></Link>
            </article>
            <article className="glass-card theme-card">
              <ThemeToggle expanded />
            </article>
          </div>
        </div>

        <div className="bento-span-12">
          <SiteDashboard posts={stats.posts} categories={stats.categories} />
        </div>
      </section>
    </div>
  );
}
