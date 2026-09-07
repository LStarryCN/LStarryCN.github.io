import type { Metadata } from "next";
import { ExternalLink, FolderGit2, GitBranch } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "项目",
  description: "LStarry 的项目实践、技术选型与复盘。",
  alternates: { canonical: "/projects/" },
};

export default function ProjectsPage() {
  return (
    <div className="page-shell inner-page">
      <header className="page-hero glass-card">
        <span className="page-icon"><FolderGit2 size={25} /></span>
        <div><span className="section-kicker">项目</span><h1>项目实践</h1><p>记录项目中的设计、实现、取舍与复盘。</p></div>
        <strong className="hero-count">{projects.length}<small>个项目</small></strong>
      </header>
      {projects.length ? (
        <section className="projects-grid">
          {projects.map((project) => (
            <article className="project-card glass-card" key={project.name}>
              <span>{project.status}</span><h2>{project.name}</h2><p>{project.description}</p>
              <div className="soft-chips">{project.tech.map((item) => <span key={item}>{item}</span>)}</div>
              <div className="project-links">
                {project.github ? <a href={project.github} target="_blank" rel="noreferrer"><GitBranch size={17} /> GitHub</a> : null}
                {project.demo ? <a href={project.demo} target="_blank" rel="noreferrer"><ExternalLink size={17} /> Demo</a> : null}
              </div>
            </article>
          ))}
        </section>
      ) : <EmptyState title="项目内容正在整理中" description="这里不会用虚构项目填充；有可公开的实践记录后会逐步更新。" />}
    </div>
  );
}
