"use client";

import { ListTree, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { TocItem } from "@/types/content";

function TocLinks({ toc, active, onNavigate }: { toc: TocItem[]; active: string; onNavigate?: () => void }) {
  return (
    <nav className="toc-links" aria-label="文章目录">
      {toc.map((item) => (
        <a
          className={`${item.level > 2 ? "toc-nested" : ""} ${active === item.id ? "active" : ""}`}
          href={`#${item.id}`}
          onClick={onNavigate}
          key={item.id}
        >{item.text}</a>
      ))}
    </nav>
  );
}

export function PostToc({ toc }: { toc: TocItem[] }) {
  const [active, setActive] = useState(toc[0]?.id || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));
    if (!headings.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible?.target.id) setActive(visible.target.id);
    }, { rootMargin: "-96px 0px -68% 0px" });
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [toc]);

  if (!toc.length) return null;

  return (
    <>
      <aside className="article-toc glass-card">
        <div className="toc-title"><ListTree size={17} /> 目录</div>
        <TocLinks toc={toc} active={active} />
      </aside>
      <button className="mobile-toc-button" type="button" onClick={() => setOpen(true)}>
        <ListTree size={18} /> 目录
      </button>
      {open ? (
        <div className="toc-drawer-backdrop" onClick={() => setOpen(false)}>
          <aside className="toc-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="toc-drawer-header">
              <strong>文章目录</strong>
              <button type="button" onClick={() => setOpen(false)} aria-label="关闭目录"><X size={20} /></button>
            </div>
            <TocLinks toc={toc} active={active} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
