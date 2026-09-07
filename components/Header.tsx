"use client";

import {
  Archive,
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  GitBranch,
  Menu,
  Rss,
  Search,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CurrentTime } from "@/components/CurrentTime";
import { ThemeToggle } from "@/components/ThemeToggle";
import { formatDate, postHref } from "@/lib/format";
import { siteConfig } from "@/siteConfig";
import type { PostMeta } from "@/types/content";

type Panel = "search" | "profile" | "mobile" | null;
type Indicator = { x: number; width: number };

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href.replace(/\/$/, "") + "/");
}

function useDialogFocus(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const autoFocus = panelRef.current?.querySelector<HTMLElement>("[data-autofocus]");
      const firstControl = panelRef.current?.querySelector<HTMLElement>(focusableSelector);
      (autoFocus || firstControl || panelRef.current)?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const controls = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((item) => !item.hasAttribute("hidden"));
      if (!controls.length) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose, open]);

  return panelRef;
}

function SearchDialog({
  open,
  posts,
  onClose,
}: {
  open: boolean;
  posts: PostMeta[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const panelRef = useDialogFocus(open, onClose);
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  const matches = useMemo(() => {
    const candidates = normalized
      ? posts.filter((post) =>
          [post.title, post.description, post.category, post.subcategory || "", ...post.tags]
            .join(" ")
            .toLocaleLowerCase("zh-CN")
            .includes(normalized),
        )
      : posts;
    return candidates.slice(0, 6);
  }, [normalized, posts]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  if (!open) return null;

  const closeFromBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className="dialog-backdrop" onMouseDown={closeFromBackdrop}>
      <section
        aria-labelledby="search-dialog-title"
        aria-modal="true"
        className="search-dialog"
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="dialog-heading">
          <div><span>站内搜索</span><h2 id="search-dialog-title">找到想读的记录</h2></div>
          <button type="button" onClick={onClose} aria-label="关闭搜索"><X size={21} /></button>
        </header>
        <form action="/posts/" className="global-search-form" role="search">
          <Search size={21} aria-hidden="true" />
          <label className="sr-only" htmlFor="global-search-input">搜索文章</label>
          <input
            data-autofocus
            id="global-search-input"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索标题、分类或标签"
            autoComplete="off"
          />
          <kbd>Esc</kbd>
        </form>
        <div className="search-result-label">{normalized ? "搜索结果" : "最近文章"}</div>
        <div className="global-search-results">
          {matches.length ? matches.map((post) => (
            <Link href={postHref(post.slug)} onClick={onClose} key={post.slug}>
              <span><strong>{post.title}</strong><small>{post.description}</small></span>
              <span className="search-result-meta">{post.subcategory || post.category}<ArrowUpRight size={16} /></span>
            </Link>
          )) : (
            <p>没有匹配的文章。可以换一个关键词，或前往文章归档继续筛选。</p>
          )}
        </div>
        <Link className="search-archive-link" href="/posts/" onClick={onClose}>
          <Archive size={17} /> 打开文章归档
        </Link>
      </section>
    </div>
  );
}

type HeatmapDay = { date: string; count: number };

function ArticleHeatmap({ posts }: { posts: PostMeta[] }) {
  const [days, setDays] = useState<HeatmapDay[]>([]);

  useEffect(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) => counts.set(post.date, (counts.get(post.date) || 0) + 1));

    const parts = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      timeZone: "Asia/Shanghai",
    }).formatToParts(new Date());
    const read = (type: "year" | "month" | "day") => Number(parts.find((part) => part.type === type)?.value);
    const today = new Date(Date.UTC(read("year"), read("month") - 1, read("day")));
    const start = new Date(today);
    start.setUTCDate(today.getUTCDate() - (14 * 7 - 1));

    const nextDays = Array.from({ length: 14 * 7 }, (_, index) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + index);
      const key = date.toISOString().slice(0, 10);
      return { date: key, count: counts.get(key) || 0 };
    });
    setDays(nextDays);
  }, [posts]);

  return (
    <div className="article-heatmap" aria-label="过去十四周的文章发布活动">
      {days.map((day) => (
        <span
          aria-hidden="true"
          className={day.count ? "active" : ""}
          data-level={Math.min(day.count, 3)}
          key={day.date}
          title={`${day.date} · ${day.count} 篇文章`}
        />
      ))}
    </div>
  );
}

function ProfileDialog({
  open,
  posts,
  onClose,
}: {
  open: boolean;
  posts: PostMeta[];
  onClose: () => void;
}) {
  const panelRef = useDialogFocus(open, onClose);
  if (!open) return null;

  const closeFromBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className="dialog-backdrop profile-backdrop" onMouseDown={closeFromBackdrop}>
      <section
        aria-labelledby="profile-dialog-title"
        aria-modal="true"
        className="profile-dialog"
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <button className="profile-dialog-close" data-autofocus type="button" onClick={onClose} aria-label="关闭个人资料">
          <X size={20} />
        </button>
        <div className="profile-main">
          <div className="profile-dialog-identity">
            <img src="/images/avatar/lstarry-logo.jpeg" alt="" width="76" height="76" />
            <div>
              <span>个人资料</span>
              <h2 id="profile-dialog-title">LStarry</h2>
              <p>软件工程本科生</p>
            </div>
          </div>
          <p className="profile-dialog-copy">
            我是 LStarry。这里主要记录算法、开发和一些日常想法。
          </p>
          <div className="profile-links">
            <a href={siteConfig.github} target="_blank" rel="noreferrer"><GitBranch size={18} /> GitHub</a>
            <Link href="/posts/" onClick={onClose}><Archive size={18} /> 文章归档</Link>
            <Link href="/atom.xml" onClick={onClose}><Rss size={18} /> RSS</Link>
          </div>
          <div className="profile-activity-heading">
            <span>过去 14 周文章活动</span>
            <strong>{posts.length} 篇文章</strong>
          </div>
          <ArticleHeatmap posts={posts} />
          <p className="heatmap-note">深色方格仅代表真实发布日期，没有文章的日期保持空白。</p>
        </div>
        <aside className="profile-facts">
          <div className="profile-live-time">
            <span>上海时间</span>
            <CurrentTime detailed />
          </div>
          <dl>
            <div><dt>建站时间</dt><dd>{formatDate(siteConfig.buildDate.slice(0, 10))}</dd></div>
            <div><dt>文章数量</dt><dd>{posts.length} 篇</dd></div>
            <div><dt>内容方向</dt><dd>算法 · 开发 · 随笔</dd></div>
          </dl>
        </aside>
      </section>
    </div>
  );
}

function MobileDrawer({
  open,
  pathname,
  onClose,
  onSearch,
  onProfile,
}: {
  open: boolean;
  pathname: string;
  onClose: () => void;
  onSearch: () => void;
  onProfile: () => void;
}) {
  const panelRef = useDialogFocus(open, onClose);
  if (!open) return null;

  const closeFromBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className="mobile-drawer-backdrop" onMouseDown={closeFromBackdrop}>
      <aside
        aria-labelledby="mobile-nav-title"
        aria-modal="true"
        className="mobile-drawer"
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <header>
          <div><span>导航</span><strong id="mobile-nav-title">LStarry の 星屿</strong></div>
          <button data-autofocus type="button" onClick={onClose} aria-label="关闭菜单"><X size={21} /></button>
        </header>
        <nav aria-label="移动端导航">
          {siteConfig.navigation.map((item) => (
            <div className="mobile-route-group" key={item.href}>
              <Link
                aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                className={isActivePath(pathname, item.href) ? "active" : ""}
                href={item.href}
                onClick={onClose}
              >
                {item.label}<ArrowUpRight size={16} />
              </Link>
              {"children" in item ? (
                <div className="mobile-subroutes">
                  {item.children.map((child) => (
                    <Link
                      className={isActivePath(pathname, child.href) ? "active" : ""}
                      href={child.href}
                      onClick={onClose}
                      key={child.href}
                    >{child.label}</Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        <div className="mobile-drawer-actions">
          <button type="button" onClick={onSearch}><Search size={18} /> 搜索</button>
          <button type="button" onClick={onProfile}><UserRound size={18} /> 个人资料</button>
          <ThemeToggle expanded />
        </div>
      </aside>
    </div>
  );
}

function FloatingTools({ onProfile }: { onProfile: () => void }) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 480);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <aside className="floating-tools" aria-label="页面工具">
      <button type="button" onClick={onProfile} aria-label="打开个人资料" title="个人资料"><UserRound size={20} /></button>
      <ThemeToggle />
      <button
        aria-hidden={!showTop}
        className={showTop ? "" : "is-hidden"}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        tabIndex={showTop ? 0 : -1}
        type="button"
        aria-label="返回顶部"
        title="返回顶部"
      ><ArrowUp size={20} /></button>
    </aside>
  );
}

export function Header({ posts }: { posts: PostMeta[] }) {
  const pathname = usePathname();
  const [panel, setPanel] = useState<Panel>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [shortcut, setShortcut] = useState("Ctrl K");
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const closeTimer = useRef<number | null>(null);

  const closePanel = useCallback(() => setPanel(null), []);
  const openPanel = useCallback((nextPanel: Exclude<Panel, null>) => {
    setOpenDropdown(null);
    setPanel(nextPanel);
  }, []);

  useEffect(() => {
    setPanel(null);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const isApple = /Mac|iPhone|iPad/.test(navigator.platform);
    setShortcut(isApple ? "⌘ K" : "Ctrl K");
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPanel("search");
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [openPanel]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let frame = 0;
    const update = () => {
      const active = siteConfig.navigation.find((item) => isActivePath(pathname, item.href));
      const item = active ? itemRefs.current[active.href] : null;
      if (!item) return;
      setIndicator({ x: item.offsetLeft, width: item.offsetWidth });
    };
    const queueUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };
    queueUpdate();
    const observer = new ResizeObserver(queueUpdate);
    observer.observe(nav);
    Object.values(itemRefs.current).forEach((item) => item && observer.observe(item));
    document.fonts?.ready.then(queueUpdate);
    window.addEventListener("resize", queueUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", queueUpdate);
    };
  }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpenDropdown(null), 140);
  };
  const handleHeaderKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && openDropdown) {
      event.preventDefault();
      const href = openDropdown;
      setOpenDropdown(null);
      itemRefs.current[href]?.querySelector<HTMLButtonElement>(".nav-dropdown-toggle")?.focus();
    }
  };
  const focusFirstDropdownLink = (href: string) => {
    window.requestAnimationFrame(() => {
      itemRefs.current[href]?.querySelector<HTMLAnchorElement>(".nav-dropdown a")?.focus();
    });
  };

  return (
    <>
      <header className="site-header" ref={headerRef} onKeyDown={handleHeaderKeyDown}>
        <nav className="header-shell" aria-label="主导航">
          <div className="brand-pill nav-glass">
            <button type="button" onClick={() => openPanel("profile")} aria-label="打开 LStarry 个人资料">
              <span className="brand-avatar" aria-hidden="true" />
            </button>
            <Link href="/" aria-label="LStarry 首页">
              <strong>LStarry</strong><span>の 星屿</span>
            </Link>
          </div>

          <div className={indicator ? "primary-nav-pill nav-glass indicator-ready" : "primary-nav-pill nav-glass"} ref={navRef}>
            {indicator ? (
              <span
                aria-hidden="true"
                className="nav-active-indicator"
                style={{ left: indicator.x, width: indicator.width }}
              />
            ) : null}
            {siteConfig.navigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              const hasChildren = "children" in item;
              const expanded = openDropdown === item.href;
              return (
                <div
                  className={active ? "nav-entry active" : "nav-entry"}
                  key={item.href}
                  ref={(node) => { itemRefs.current[item.href] = node; }}
                  onMouseEnter={() => {
                    cancelClose();
                    if (hasChildren) setOpenDropdown(item.href);
                  }}
                  onMouseLeave={scheduleClose}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) scheduleClose();
                  }}
                >
                  <Link
                    aria-current={active ? "page" : undefined}
                    className="nav-entry-link"
                    href={item.href}
                  >{item.label}</Link>
                  {hasChildren ? (
                    <button
                      aria-controls={`dropdown-${item.href.split("/").filter(Boolean).join("-")}`}
                      aria-expanded={expanded}
                      aria-haspopup="true"
                      aria-label={`展开${item.label}分类`}
                      className="nav-dropdown-toggle"
                      onClick={() => setOpenDropdown(expanded ? null : item.href)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          setOpenDropdown(item.href);
                          focusFirstDropdownLink(item.href);
                        }
                      }}
                      type="button"
                    ><ChevronDown size={14} /></button>
                  ) : null}
                  {hasChildren ? (
                    <div
                      className={expanded ? "nav-dropdown open" : "nav-dropdown"}
                      id={`dropdown-${item.href.split("/").filter(Boolean).join("-")}`}
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                    >
                      <div className="nav-dropdown-heading"><span>{item.label}</span><small>浏览分类</small></div>
                      {item.children.map((child) => (
                        <Link
                          aria-current={isActivePath(pathname, child.href) ? "page" : undefined}
                          className={isActivePath(pathname, child.href) ? "active" : ""}
                          href={child.href}
                          key={child.href}
                        >{child.label}<ArrowUpRight size={14} /></Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <button className="search-pill nav-glass" type="button" onClick={() => openPanel("search")} aria-label="打开站内搜索">
            <span>{shortcut}</span><Search size={21} />
          </button>

          <div className="mobile-header-actions">
            <button className="mobile-search-button nav-glass" type="button" onClick={() => openPanel("search")} aria-label="打开站内搜索"><Search size={20} /></button>
            <button className="mobile-menu-button nav-glass" type="button" onClick={() => openPanel("mobile")} aria-label="打开导航菜单"><Menu size={22} /></button>
          </div>
        </nav>
      </header>

      <SearchDialog open={panel === "search"} posts={posts} onClose={closePanel} />
      <ProfileDialog open={panel === "profile"} posts={posts} onClose={closePanel} />
      <MobileDrawer
        open={panel === "mobile"}
        pathname={pathname}
        onClose={closePanel}
        onSearch={() => openPanel("search")}
        onProfile={() => openPanel("profile")}
      />
      <FloatingTools onProfile={() => openPanel("profile")} />
    </>
  );
}
