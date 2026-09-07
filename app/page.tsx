import {
  ArrowUpRight,
  BookOpenText,
  Code2,
  FolderGit2,
  GraduationCap,
  PenLine,
} from "lucide-react";
import Link from "next/link";
import { CurrentTime } from "@/components/CurrentTime";
import { projects } from "@/data/projects";
import { formatDate, postHref } from "@/lib/format";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/siteConfig";

export default function HomePage() {
  const posts = getAllPosts();
  const latest = posts[0];

  return (
    <div className="home-page">
      <section className="immersive-hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="hero-subtitle">{siteConfig.subtitle}</p>
          <h1 id="home-title">{siteConfig.name}</h1>
          <p className="hero-introduction">
            我是 LStarry，软件工程本科生。<br />
            这里主要记录算法、开发和一些日常想法。
          </p>
          <Link className="hero-article-link" href="/posts/" prefetch={false}>
            进入文章 <ArrowUpRight size={17} />
          </Link>
        </div>

        <aside className="hero-clock" aria-label="上海当前时间">
          <span>Asia / Shanghai</span>
          <CurrentTime detailed />
        </aside>

      </section>

      <section className="home-content" id="home-content" aria-label="博客内容">
        <div className="home-content-inner">
          <header className="home-section-heading">
            <div>
              <span>最近的记录</span>
              <h2>从一篇真实文章开始</h2>
            </div>
            <Link href="/posts/" prefetch={false}>查看文章归档 <ArrowUpRight size={16} /></Link>
          </header>

          <div className="home-editorial-grid">
            {latest ? (
              <article className="home-latest-post">
                {latest.cover ? (
                  <Link className="home-latest-cover" href={postHref(latest.slug)} prefetch={false}>
                    <img src={latest.cover} alt="" />
                  </Link>
                ) : null}
                <div className="home-latest-copy">
                  <div className="home-latest-meta">
                    <span>{latest.subcategory || latest.category}</span>
                    <time dateTime={latest.date}>{formatDate(latest.date)}</time>
                    <span>约 {latest.readingTime} 分钟</span>
                  </div>
                  <h3><Link href={postHref(latest.slug)} prefetch={false}>{latest.title}</Link></h3>
                  <p>{latest.description}</p>
                  <div className="home-latest-footer">
                    <div className="tag-row">
                      {latest.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
                    </div>
                    <Link href={postHref(latest.slug)} prefetch={false}>阅读全文 <ArrowUpRight size={16} /></Link>
                  </div>
                </div>
              </article>
            ) : (
              <div className="home-quiet-empty">
                <BookOpenText size={22} />
                <div><strong>文章还在整理</strong><span>准备好后会从这里开始。</span></div>
              </div>
            )}

            <nav className="home-topic-list" aria-label="内容分类">
              <Link href="/topics/algorithm/" prefetch={false}>
                <span><Code2 size={19} /> 算法</span>
                <small>字符串、数据结构、图论与动态规划</small>
                <ArrowUpRight size={17} />
              </Link>
              <Link href="/topics/dev/" prefetch={false}>
                <span><FolderGit2 size={19} /> 开发</span>
                <small>C++、Java、Python 与 AI</small>
                <ArrowUpRight size={17} />
              </Link>
              <Link href="/topics/learning/" prefetch={false}>
                <span><GraduationCap size={19} /> 学习</span>
                <small>学习笔记与阶段记录</small>
                <ArrowUpRight size={17} />
              </Link>
              <Link href="/topics/essay/" prefetch={false}>
                <span><PenLine size={19} /> 随笔</span>
                <small>技术之外的观察与想法</small>
                <ArrowUpRight size={17} />
              </Link>
            </nav>
          </div>

          <div className="home-destination-row">
            <Link href="/projects/" prefetch={false}>
              <span>项目</span>
              <strong>{projects.length ? `${projects.length} 个公开项目` : "暂无公开项目"}</strong>
              <small>只展示真实实践记录</small>
            </Link>
            <Link href="/posts/" prefetch={false}>
              <span>归档</span>
              <strong>{posts.length} 篇文章</strong>
              <small>搜索、筛选与切换视图</small>
            </Link>
            <Link href="/about/" prefetch={false}>
              <span>关于</span>
              <strong>认识 LStarry</strong>
              <small>这个博客为何存在</small>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
