import type { Metadata } from "next";
import { Code2, GitBranch, Sparkles } from "lucide-react";
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
          <div className="about-mark"><Sparkles size={42} /></div>
          <div><span className="section-kicker">关于我</span><h1>{siteConfig.name}</h1><p>{siteConfig.role}</p></div>
        </div>
        <div className="about-copy">
          <p>你好，我是 LStarry。</p>
          <p>这里主要记录我的编程学习、算法思考、项目实践以及长期学习过程中的笔记。</p>
        </div>
        <div className="interest-block">
          <span><Code2 size={17} /> INTERESTS</span>
          <div className="soft-chips">{interests.map((interest) => <span key={interest}>{interest}</span>)}</div>
        </div>
        <a className="primary-link" href={siteConfig.github} target="_blank" rel="noreferrer"><GitBranch size={18} /> GitHub</a>
      </section>
      <aside className="glass-card about-note">
        <span className="section-kicker">为何记录</span>
        <h2>让学习留下可以检索的路径</h2>
        <p>这里不追求内容数量。比起快速堆叠，更希望每一篇记录都能在未来解决一个具体问题。</p>
      </aside>
    </div>
  );
}
