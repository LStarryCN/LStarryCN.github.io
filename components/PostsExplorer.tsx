"use client";

import { Grid2X2, List, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/EmptyState";
import type { PostMeta } from "@/types/content";

type View = "grid" | "list";

export function PostsExplorer({ posts }: { posts: PostMeta[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [tag, setTag] = useState("全部");
  const [view, setView] = useState<View>("grid");

  useEffect(() => {
    const incoming = new URLSearchParams(window.location.search).get("q");
    if (incoming) setQuery(incoming);
  }, []);

  const categories = useMemo(
    () => ["全部", ...new Set(posts.map((post) => post.category))],
    [posts],
  );
  const tags = useMemo(
    () => ["全部", ...new Set(posts.flatMap((post) => post.tags))],
    [posts],
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return posts.filter((post) => {
      const matchesQuery = !normalized ||
        [post.title, post.description, post.category, post.subcategory || "", ...post.tags]
          .join(" ")
          .toLocaleLowerCase("zh-CN")
          .includes(normalized);
      return matchesQuery &&
        (category === "全部" || post.category === category) &&
        (tag === "全部" || post.tags.includes(tag));
    });
  }, [category, posts, query, tag]);

  const hasFilters = Boolean(query || category !== "全部" || tag !== "全部");
  const reset = () => {
    setQuery("");
    setCategory("全部");
    setTag("全部");
    window.history.replaceState(null, "", "/posts/");
  };

  return (
    <section className="posts-explorer" aria-label="文章筛选">
      <div className="explorer-toolbar glass-card">
        <div className="archive-search">
          <Search size={19} />
          <label className="sr-only" htmlFor="archive-search">搜索文章</label>
          <input
            id="archive-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索标题、描述、分类或标签"
          />
          {query ? <button type="button" onClick={() => setQuery("")} aria-label="清空搜索"><X size={18} /></button> : null}
        </div>
        <div className="view-switch" aria-label="文章视图">
          <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} type="button" aria-label="网格视图"><Grid2X2 size={18} /></button>
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")} type="button" aria-label="列表视图"><List size={19} /></button>
        </div>
      </div>

      <div className="filter-section glass-card">
        <div className="filter-heading"><SlidersHorizontal size={17} /> 分类</div>
        <div className="chips">
          {categories.map((item) => (
            <button
              type="button"
              className={category === item ? "chip active" : "chip"}
              onClick={() => setCategory(item)}
              key={item}
            >{item}</button>
          ))}
        </div>
        <div className="filter-heading">标签</div>
        <div className="chips">
          {tags.map((item) => (
            <button
              type="button"
              className={tag === item ? "chip active" : "chip"}
              onClick={() => setTag(item)}
              key={item}
            >{item === "全部" ? item : `#${item}`}</button>
          ))}
        </div>
      </div>

      <div className="result-heading">
        <span>找到 <strong>{filtered.length}</strong> 篇文章</span>
        {hasFilters ? <button type="button" onClick={reset}>重置筛选</button> : null}
      </div>

      {filtered.length ? (
        <div className={view === "grid" ? "posts-grid" : "posts-grid posts-list"}>
          {filtered.map((post) => <PostCard post={post} key={post.slug} />)}
        </div>
      ) : (
        <EmptyState
          title="没有找到匹配的文章"
          description="换一个关键词或清除筛选条件后再试试。"
        />
      )}
    </section>
  );
}
