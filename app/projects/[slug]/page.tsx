import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ProjectPicture } from "@/components/ProjectPicture";
import { projects } from "@/data/projects";
import { siteConfig } from "@/siteConfig";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  const url = `/projects/${project.slug}/`;
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url: `${siteConfig.url}${url}`,
      title: project.title,
      description: project.description,
      images: project.cover ? [{ url: project.cover, alt: project.coverAlt || project.title }] : undefined,
    },
  };
}

function CaseSection({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return <section className="case-section">
    <div className="case-heading"><span>{label}</span><h2>{title}</h2></div>
    <div className="case-content">{children}</div>
  </section>;
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((item) => item.slug === slug);
  if (index < 0) notFound();
  const project = projects[index];
  const next = projects[index + 1];

  return <div className="page-shell inner-page project-detail">
    <article className="project-case-study">
      <header className="case-hero">
        <span className="portfolio-index">{String(index + 1).padStart(2, "0")} / PROJECT</span>
        <h1>{project.title}</h1>
        {project.subtitle ? <p className="case-subtitle">{project.subtitle}</p> : null}
        <p className="case-intro">{project.description}</p>
        <div className="case-meta">
          <span>{project.year} · {project.status.toUpperCase()}</span>
          <div>
            {project.github ? <a href={project.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={16} /></a> : null}
            {project.demo ? <a href={project.demo} target="_blank" rel="noopener noreferrer">Live <ArrowUpRight size={16} /></a> : null}
          </div>
        </div>
      </header>

      {project.cover ? <ProjectPicture image={{ src: project.cover, alt: project.coverAlt || `${project.title} 界面截图` }}
        className="case-cover" sizes="(max-width: 1200px) calc(100vw - 48px), 1100px" priority /> : null}

      {project.why ? <CaseSection label="WHY" title="为什么做"><p>{project.why}</p></CaseSection> : null}

      {project.features?.length ? <CaseSection label="FEATURES" title="项目功能">
        <ol className="case-features">{project.features.map((feature, featureIndex) =>
          <li key={feature.title}><span>{String(featureIndex + 1).padStart(2, "0")}</span>
            <div><h3>{feature.title}</h3><p>{feature.description}</p></div></li>)}</ol>
      </CaseSection> : null}

      {project.technologies.length ? <CaseSection label="TECH STACK" title="核心技术">
        <ul className="case-stack">{project.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
      </CaseSection> : null}

      {project.challenge ? <CaseSection label="CHALLENGE" title="需要解决的问题"><p>{project.challenge}</p></CaseSection> : null}
      {project.solution ? <CaseSection label="SOLUTION" title="采用的方案"><p>{project.solution}</p></CaseSection> : null}
      {project.implementation ? <CaseSection label="IMPLEMENTATION" title="设计与实现"><p>{project.implementation}</p></CaseSection> : null}

      {project.gallery?.length ? <CaseSection label="GALLERY" title="更多界面">
        <div className="case-gallery">{project.gallery.map((image) =>
          <figure key={image.src}><ProjectPicture image={image} className="case-gallery-image"
            sizes="(max-width: 800px) calc(100vw - 48px), 780px" />
            {image.caption ? <figcaption>{image.caption}</figcaption> : null}</figure>)}</div>
      </CaseSection> : null}

      {project.github || project.demo ? <CaseSection label="LINKS" title="项目链接">
        <div className="case-links">
          {project.github ? <a href={project.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={18} /></a> : null}
          {project.demo ? <a href={project.demo} target="_blank" rel="noopener noreferrer">Live Website <ArrowUpRight size={18} /></a> : null}
        </div>
      </CaseSection> : null}

      <nav className="case-navigation" aria-label="项目导航">
        <a href="/projects/"><ArrowLeft size={18} /> 返回项目</a>
        {next ? <a href={`/projects/${next.slug}/`} className="case-next"><span><small>下一个项目</small>{next.title}</span><ArrowRight size={18} /></a> : null}
      </nav>
    </article>
  </div>;
}
