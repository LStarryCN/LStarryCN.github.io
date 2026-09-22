import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, FolderGit2 } from "lucide-react";
import { ProjectPicture } from "@/components/ProjectPicture";
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
        <div><span className="section-kicker">项目</span><h1>项目实践</h1><p>浏览项目，了解背后的设计与实现。</p></div>
        <strong className="hero-count">{projects.length}<small>个项目</small></strong>
      </header>
      <section className="portfolio-list" aria-label="公开项目">
        {projects.map((project, index) => (
            <article className="portfolio-entry" key={project.slug}>
              <div className="portfolio-index">{String(index + 1).padStart(2, "0")} / {project.title.toUpperCase()}</div>
              <div className="portfolio-body">
                <div className="portfolio-summary">
                  <h2><a href={`/projects/${project.slug}/`}>{project.title}</a></h2>
                  {project.subtitle ? <p className="portfolio-subtitle">{project.subtitle}</p> : null}
                  <p>{project.description}</p>
                  <div className="portfolio-tech">{project.technologies.join(" · ")}</div>
                </div>
                {project.cover ? <a className="portfolio-cover-link" href={`/projects/${project.slug}/`}
                  aria-label={`查看 ${project.title} 项目详情`}>
                  <ProjectPicture image={{ src: project.cover, alt: project.coverAlt || `${project.title} 界面截图` }}
                    className="portfolio-cover" sizes="(max-width: 800px) calc(100vw - 48px), 600px" />
                </a> : null}
              </div>
              <footer className="portfolio-footer">
                <span>{project.year} · {project.status.toUpperCase()}</span>
                <div>
                  <a className="portfolio-view" href={`/projects/${project.slug}/`}>查看项目 <ArrowRight size={16} /></a>
                  {project.github ? <a href={project.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={15} /></a> : null}
                  {project.demo ? <a href={project.demo} target="_blank" rel="noopener noreferrer">Live <ArrowUpRight size={15} /></a> : null}
                </div>
              </footer>
            </article>
        ))}
      </section>
    </div>
  );
}
