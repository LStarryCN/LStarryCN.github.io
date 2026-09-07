import { GitBranch, Rss, Sparkles } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/siteConfig";

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <span><Sparkles size={16} /> {siteConfig.name}</span>
        <p>{siteConfig.description}</p>
      </div>
      <div className="footer-links">
        <a href={siteConfig.github} target="_blank" rel="noreferrer"><GitBranch size={17} /> GitHub</a>
        <Link href="/atom.xml"><Rss size={17} /> RSS</Link>
      </div>
    </footer>
  );
}
