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

export type Project = {
  name: string;
  description: string;
  tech: string[];
  github?: string;
  demo?: string;
  cover?: string;
  status: "planning" | "active" | "complete" | "paused";
};
