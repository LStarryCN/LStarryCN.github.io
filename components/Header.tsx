"use client";

import {
  Archive,
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  GitBranch,
  Mail,
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
            <Link href={postHref(post.slug)} onClick={onClose} key={post.slug} prefetch={false}>
              <span><strong>{post.title}</strong><small>{post.description}</small></span>
              <span className="search-result-meta">{post.subcategory || post.category}<ArrowUpRight size={16} /></span>
            </Link>
          )) : (
            <p>没有匹配的文章。可以换一个关键词，或前往文章归档继续筛选。</p>
          )}
        </div>
        <Link className="search-archive-link" href="/posts/" onClick={onClose} prefetch={false}>
          <Archive size={17} /> 打开文章归档
        </Link>
      </section>
    </div>
  );
}

type HeatmapDay = { date: string; count: number };

function getHeatmapDays(posts: PostMeta[]): HeatmapDay[] {
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

  return Array.from({ length: 14 * 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return { date: key, count: counts.get(key) || 0 };
  });
}

function ArticleHeatmap({ days }: { days: HeatmapDay[] }) {

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

function ProfileCard({
  open,
  days,
  postCount,
  onClose,
}: {
  open: boolean;
  days: HeatmapDay[];
  postCount: number;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <>
      <button className="profile-card-scrim" type="button" onClick={onClose} aria-label="关闭个人资料" />
      <section
        aria-labelledby="profile-dialog-title"
        className="profile-card"
        id="profile-card"
        role="dialog"
      >
        <button className="profile-dialog-close" type="button" onClick={onClose} aria-label="关闭个人资料">
          <X size={20} />
        </button>
        <div className="profile-main">
          <div className="profile-dialog-identity">
            <img src="/images/avatar/lstarry-logo.jpeg" alt="" width="76" height="76" />
            <div>
              <span>个人资料</span>
              <h2 id="profile-dialog-title">LStarry</h2>
              <p>{siteConfig.role}</p>
            </div>
          </div>
          <p className="profile-dialog-copy">
            {siteConfig.description}
          </p>
          <div className="profile-links">
            <a href={siteConfig.github} target="_blank" rel="noreferrer"><GitBranch size={18} /> GitHub</a>
            {siteConfig.social.email ? (
              <a href={`mailto:${siteConfig.social.email}`}><Mail size={18} /> 邮箱</a>
            ) : null}
            <Link href="/posts/" onClick={onClose} prefetch={false}><Archive size={18} /> 文章归档</Link>
            <Link href="/atom.xml" onClick={onClose} prefetch={false}><Rss size={18} /> RSS</Link>
          </div>
          <div className="profile-activity-heading">
            <span>过去 14 周文章活动</span>
            <strong>{postCount} 篇文章</strong>
          </div>
          <ArticleHeatmap days={days} />
        </div>
        <aside className="profile-facts">
          <div className="profile-live-time">
            <span>上海时间</span>
            <CurrentTime detailed />
          </div>
          <dl>
            <div><dt>建站时间</dt><dd>{formatDate(siteConfig.buildDate.slice(0, 10))}</dd></div>
            <div><dt>文章数量</dt><dd>{postCount} 篇</dd></div>
            <div><dt>内容方向</dt><dd>{siteConfig.currentStatus.learning.join("、")}</dd></div>
          </dl>
        </aside>
      </section>
    </>
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
                prefetch={false}
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
                      prefetch={false}
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
  const sentinelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setShowTop(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <span className="scroll-top-sentinel" ref={sentinelRef} aria-hidden="true" />
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
    </>
  );
}

export function Header({ posts }: { posts: PostMeta[] }) {
  const pathname = usePathname();
  const [panel, setPanel] = useState<Panel>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [shortcut, setShortcut] = useState("Ctrl K");
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const profileZoneRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const closeTimer = useRef<number | null>(null);
  const profileCloseTimer = useRef<number | null>(null);
  const activeHref = siteConfig.navigation.find((item) => isActivePath(pathname, item.href))?.href || "/";
  const heatmapDays = useMemo(() => getHeatmapDays(posts), [posts]);

  const closePanel = useCallback(() => setPanel(null), []);
  const openPanel = useCallback((nextPanel: Exclude<Panel, null>) => {
    setOpenDropdown(null);
    setPanel(nextPanel);
  }, []);
  const closeProfile = useCallback(() => {
    setPanel((current) => current === "profile" ? null : current);
  }, []);
  const cancelProfileClose = () => {
    if (profileCloseTimer.current) window.clearTimeout(profileCloseTimer.current);
  };
  const scheduleProfileClose = () => {
    cancelProfileClose();
    profileCloseTimer.current = window.setTimeout(closeProfile, 180);
  };
  const openProfile = () => {
    cancelProfileClose();
    openPanel("profile");
  };

  useEffect(() => {
    const loadBodyFont = () => { void import("@fontsource-variable/noto-sans-sc"); };
    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(loadBodyFont);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const measureIndicator = useCallback((href: string) => {
    const item = itemRefs.current[href];
    if (!item) return;
    const next = { x: item.offsetLeft, width: item.offsetWidth };
    setIndicator((current) => current?.x === next.x && current.width === next.width ? current : next);
  }, []);

  useEffect(() => {
    setPanel(null);
    setOpenDropdown(null);
    setHoveredHref(null);
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
    let active = true;
    const update = () => {
      measureIndicator(hoveredHref || activeHref);
    };
    const queueUpdate = () => {
      if (!active) return;
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
      active = false;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", queueUpdate);
    };
  }, [activeHref, hoveredHref, measureIndicator]);

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (profileCloseTimer.current) window.clearTimeout(profileCloseTimer.current);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!headerRef.current?.contains(target)) setOpenDropdown(null);
      if (!profileZoneRef.current?.contains(target)) closeProfile();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [closeProfile]);

  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpenDropdown(null), 140);
  };
  const handleHeaderKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    if (openDropdown) {
      event.preventDefault();
      const href = openDropdown;
      setOpenDropdown(null);
      itemRefs.current[href]?.querySelector<HTMLButtonElement>(".nav-dropdown-toggle")?.focus();
    } else if (panel === "profile") {
      event.preventDefault();
      closeProfile();
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
          <div
            className="brand-zone"
            ref={profileZoneRef}
            onPointerLeave={(event) => { if (event.pointerType === "mouse") scheduleProfileClose(); }}
            onFocusCapture={cancelProfileClose}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) scheduleProfileClose();
            }}
          >
            <div className="brand-pill nav-glass">
              <button
                aria-controls="profile-card"
                aria-expanded={panel === "profile"}
                aria-haspopup="dialog"
                aria-label={panel === "profile" ? "关闭 LStarry 个人资料" : "打开 LStarry 个人资料"}
                type="button"
                onClick={() => panel === "profile" ? closeProfile() : openProfile()}
                onPointerEnter={(event) => { if (event.pointerType === "mouse") openProfile(); }}
              >
                <span className="brand-avatar" aria-hidden="true" />
              </button>
              <Link href="/" aria-label="LStarry 首页" prefetch={false}>
                <strong>LStarry</strong><span>の 星屿</span>
              </Link>
            </div>
            <ProfileCard
              days={heatmapDays}
              open={panel === "profile"}
              onClose={closeProfile}
              postCount={posts.length}
            />
          </div>

          <div
            className={indicator ? "primary-nav-pill nav-glass indicator-ready" : "primary-nav-pill nav-glass"}
            ref={navRef}
            onMouseLeave={() => {
              setHoveredHref(null);
              measureIndicator(activeHref);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setHoveredHref(null);
                measureIndicator(activeHref);
              }
            }}
          >
            {indicator ? (
              <span
                aria-hidden="true"
                className="nav-active-indicator"
                style={{ transform: `translate3d(${indicator.x}px, 0, 0)`, width: indicator.width }}
              />
            ) : null}
            {siteConfig.navigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              const visualActive = hoveredHref ? hoveredHref === item.href : active;
              const hasChildren = "children" in item;
              const expanded = openDropdown === item.href;
              return (
                <div
                  className={visualActive ? "nav-entry visual-active" : "nav-entry"}
                  key={item.href}
                  ref={(node) => { itemRefs.current[item.href] = node; }}
                  onMouseEnter={() => {
                    cancelClose();
                    setHoveredHref(item.href);
                    measureIndicator(item.href);
                    if (hasChildren) setOpenDropdown(item.href);
                  }}
                  onFocusCapture={() => {
                    setHoveredHref(item.href);
                    measureIndicator(item.href);
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
                    prefetch={false}
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
                      aria-hidden={!expanded}
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
                          prefetch={false}
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
      <MobileDrawer
        open={panel === "mobile"}
        pathname={pathname}
        onClose={closePanel}
        onSearch={() => openPanel("search")}
        onProfile={openProfile}
      />
      <FloatingTools onProfile={openProfile} />
    </>
  );
}
