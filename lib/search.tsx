"use client";

import { useEffect, useMemo, useState } from "react";

export type SearchEntry = {
  slug: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  headings: string[];
  plainText: string;
};

export type SearchResult = { entry: SearchEntry; snippet: string; score: number };

let indexPromise: Promise<SearchEntry[]> | undefined;
const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase("zh-CN");

function loadIndex() {
  indexPromise ??= fetch("/search-index.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Search index HTTP ${response.status}`);
      return response.json() as Promise<SearchEntry[]>;
    })
    .catch((error) => { indexPromise = undefined; throw error; });
  return indexPromise;
}

function excerpt(entry: SearchEntry, terms: string[]) {
  const source = entry.plainText || entry.description;
  const normalized = normalize(source);
  const hits = terms.map((term) => normalized.indexOf(term)).filter((position) => position >= 0);
  if (!hits.length) return entry.description || source.slice(0, 110);
  const start = Math.max(0, Math.min(...hits) - 42);
  const end = Math.min(source.length, start + 130);
  return `${start ? "…" : ""}${source.slice(start, end).trim()}${end < source.length ? "…" : ""}`;
}

export function searchEntries(entries: SearchEntry[], query: string, limit = 100): SearchResult[] {
  const terms = [...new Set(normalize(query).trim().split(/\s+/).filter(Boolean))];
  if (!terms.length) return [];
  return entries.flatMap((entry) => {
    const fields = [entry.title, entry.headings.join(" "), entry.tags.join(" "), entry.description,
      `${entry.category} ${entry.subcategory}`, entry.plainText].map(normalize);
    if (terms.some((term) => !fields.some((field) => field.includes(term)))) return [];
    const weights = [12, 8, 7, 5, 3, 1];
    const score = terms.reduce((total, term) => total + fields.reduce((sum, field, index) =>
      sum + (field.includes(term) ? weights[index] : 0), 0), 0)
      + (fields[0].includes(normalize(query).trim()) ? 8 : 0);
    return [{ entry, snippet: excerpt(entry, terms), score }];
  }).sort((a, b) => b.score - a.score || a.entry.slug.localeCompare(b.entry.slug)).slice(0, limit);
}

export function useFullTextSearch(query: string, limit = 100) {
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [error, setError] = useState(false);
  const active = Boolean(query.trim());
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    loadIndex().then((value) => { if (!cancelled) setEntries(value); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [active]);
  const results = useMemo(() => searchEntries(entries, query, limit), [entries, query, limit]);
  return { results, loading: active && !entries.length && !error, error };
}

export function HighlightSnippet({ text, query }: { text: string; query: string }) {
  const terms = [...new Set(normalize(query).trim().split(/\s+/).filter(Boolean))];
  if (!terms.length) return text;
  const lower = normalize(text);
  const pieces: { text: string; hit: boolean }[] = [];
  for (let start = 0; start < text.length;) {
    const match = terms.map((term) => ({ index: lower.indexOf(term, start), term }))
      .filter(({ index }) => index >= 0).sort((a, b) => a.index - b.index)[0];
    if (!match) { pieces.push({ text: text.slice(start), hit: false }); break; }
    if (match.index > start) pieces.push({ text: text.slice(start, match.index), hit: false });
    pieces.push({ text: text.slice(match.index, match.index + match.term.length), hit: true });
    start = match.index + match.term.length;
  }
  return pieces.map((piece, index) => piece.hit ? <mark key={index}>{piece.text}</mark> : <span key={index}>{piece.text}</span>);
}
