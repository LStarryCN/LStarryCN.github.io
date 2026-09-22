"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { postHref } from "@/lib/format";
import { useFullTextSearch } from "@/lib/search";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  const { results: matches, loading } = useFullTextSearch(query, 5);

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
          {matches.length ? matches.map(({ entry }) => (
            <Link href={postHref(entry.slug)} key={entry.slug} prefetch={false}>
              <span>{entry.title}</span>
              <small>{entry.category}</small>
            </Link>
          )) : <p>{loading ? "正在搜索…" : "没有匹配的文章，可以前往文章页查看全部内容。"}</p>}
        </div>
      ) : null}
    </div>
  );
}
