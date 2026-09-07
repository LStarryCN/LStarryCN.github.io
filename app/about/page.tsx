import type { Metadata } from "next";
import { Code2, GitBranch } from "lucide-react";
import { siteConfig } from "@/siteConfig";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 LStarry 与这个个人技术博客。",
  alternates: { canonical: "/about/" },
};

const interests = ["Algorithms", "C++", "Java", "Python", "AI"];

export default function AboutPage() {
  return (
    <div className="page-shell inner-page about-page">
      <section className="about-card glass-card">
        <div className="about-identity">
          <div className="about-mark"><img src="/images/avatar/lstarry-logo.jpeg" alt="" width="88" height="88" /></div>
          <div><span className="section-kicker">关于我</span><h1>{siteConfig.name}</h1><p>{siteConfig.role}</p></div>
        </div>
        <div className="about-copy">
          <p>你好，我是 LStarry，软件工程本科生。</p>
          <p>这里主要记录算法、开发和一些日常想法。</p>
        </div>
        <div className="interest-block">
          <span><Code2 size={17} /> 内容方向</span>
          <div className="soft-chips">{interests.map((interest) => <span key={interest}>{interest}</span>)}</div>
        </div>
        <a className="primary-link" href={siteConfig.github} target="_blank" rel="noreferrer"><GitBranch size={18} /> GitHub</a>
      </section>
      <aside className="glass-card about-note">
        <span className="section-kicker">这个博客</span>
        <h2>把学习过程保存下来</h2>
        <p>用于整理写过的代码、学过的算法，以及值得回看的开发笔记。</p>
      </aside>
    </div>
  );
}
