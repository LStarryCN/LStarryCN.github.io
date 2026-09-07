"use client";

import {
  ChevronDown,
  GitBranch,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/siteConfig";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="site-header">
      <nav className="glass-nav" aria-label="主导航">
        <Link className="brand" href="/" aria-label="LStarry 首页">
          <span className="brand-mark"><Sparkles size={19} /></span>
          <span>{siteConfig.title}</span>
        </Link>

        <div className="desktop-nav">
          {siteConfig.navigation.map((item) => {
            const active = item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
            return (
              <div className="nav-entry" key={item.href}>
                <Link className={active ? "nav-link active" : "nav-link"} href={item.href}>
                  {item.label}
                  {"children" in item ? <ChevronDown size={14} /> : null}
                </Link>
                {"children" in item ? (
                  <div className="nav-dropdown">
                    {item.children.map((child) => (
                      <Link href={child.href} key={child.href}>{child.label}</Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="nav-actions">
          <a
            className="icon-button desktop-only"
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            aria-label="访问 LStarry 的 GitHub"
          >
            <GitBranch size={19} />
          </a>
          <span className="desktop-only"><ThemeToggle /></span>
          <button
            className="icon-button menu-button"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "关闭菜单" : "打开菜单"}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>

      <div id="mobile-navigation" className={open ? "mobile-nav open" : "mobile-nav"}>
        <div className="mobile-nav-scroll">
          {siteConfig.navigation.map((item) => (
            <div className="mobile-nav-group" key={item.href}>
              <Link className={pathname === item.href ? "active" : ""} href={item.href}>
                {item.label}
              </Link>
              {"children" in item ? (
                <div className="mobile-subnav">
                  {item.children.map((child) => (
                    <Link href={child.href} key={child.href}>{child.label}</Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <div className="mobile-nav-actions">
            <ThemeToggle expanded />
            <a href={siteConfig.github} target="_blank" rel="noreferrer">
              <GitBranch size={18} /> GitHub
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
