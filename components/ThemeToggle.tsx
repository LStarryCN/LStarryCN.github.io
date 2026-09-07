"use client";

import { MoonStar, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function detectTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("lstarry-theme");
  if (saved === "light" || saved === "dark") return saved;
  return "light";
}

export function ThemeToggle({ expanded = false }: { expanded?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const sync = () => setTheme(detectTheme());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("lstarry-theme", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("lstarry-theme", sync);
    };
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem("lstarry-theme", next);
    setTheme(next);
    window.dispatchEvent(new Event("lstarry-theme"));
  };

  const label = theme === "dark" ? "切换到浅色模式" : "切换到深色模式";

  return (
    <button
      className={expanded ? "theme-toggle theme-toggle-expanded" : "theme-toggle"}
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <span className="theme-toggle-icon">
        {theme === "dark" ? <MoonStar size={19} /> : <Sun size={19} />}
      </span>
      {expanded ? (
        <span>
          <strong>{theme === "dark" ? "深色模式" : "浅色模式"}</strong>
          <small>点击切换阅读主题</small>
        </span>
      ) : null}
    </button>
  );
}
