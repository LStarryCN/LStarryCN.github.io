export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  cover?: string;
  featured: boolean;
  draft: boolean;
  readingTime: number;
  series?: string;
  seriesOrder?: number;
  seriesSlug?: string;
};

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

export type Post = PostMeta & {
  content: string;
  contentHtml: string;
  toc: TocItem[];
};

export type ProjectImage = { src: string; alt: string; caption?: string };
export type ProjectFeature = { title: string; description: string };

export type Project = {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  year: number;
  status: "active" | "completed" | "archived";
  technologies: string[];
  github?: string;
  demo?: string;
  cover?: string;
  coverAlt?: string;
  featured?: boolean;
  why?: string;
  challenge?: string;
  solution?: string;
  features?: ProjectFeature[];
  implementation?: string;
  gallery?: ProjectImage[];
};
