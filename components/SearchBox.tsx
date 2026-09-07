"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { postHref } from "@/lib/format";
import type { PostMeta } from "@/types/content";

export function SearchBox({ posts }: { posts: PostMeta[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  const matches = useMemo(() => {
    if (!normalized) return [];
    return posts.filter((post) =>
      [post.title, post.description, post.category, post.subcategory || "", ...post.tags]
        .join(" ")
        .toLocaleLowerCase("zh-CN")
        .includes(normalized),
    ).slice(0, 5);
  }, [normalized, posts]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = query.trim()
      ? `/posts/?q=${encodeURIComponent(query.trim())}`
      : "/posts/";
    window.location.assign(target);
  };

  return (
    <div className="home-search-wrap">
      <form className="home-search" onSubmit={submit} role="search">
        <Search size={21} aria-hidden="true" />
        <label className="sr-only" htmlFor="home-search-input">搜索文章</label>
        <input
          id="home-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索文章、分类或标签…"
          autoComplete="off"
        />
        <button type="submit" aria-label="开始搜索"><ArrowRight size={20} /></button>
      </form>
      {normalized ? (
        <div className="search-suggestions">
          {matches.length ? matches.map((post) => (
            <Link href={postHref(post.slug)} key={post.slug} prefetch={false}>
              <span>{post.title}</span>
              <small>{post.category} · {post.readingTime} 分钟</small>
            </Link>
          )) : <p>没有匹配的文章，可以前往文章页查看全部内容。</p>}
        </div>
      ) : null}
    </div>
  );
}
