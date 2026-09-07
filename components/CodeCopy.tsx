"use client";

import { useEffect } from "react";

export function CodeCopy() {
  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll<HTMLElement>(".article-content pre"));
    const cleanups = blocks.map((block) => {
      if (block.querySelector(".copy-code-button")) return () => undefined;
      const button = document.createElement("button");
      button.className = "copy-code-button";
      button.type = "button";
      button.textContent = "复制";
      button.setAttribute("aria-label", "复制代码");
      const copy = async () => {
        const code = block.querySelector("code")?.textContent || "";
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = "已复制";
        } catch {
          button.textContent = "复制失败";
        }
        window.setTimeout(() => { button.textContent = "复制"; }, 1600);
      };
      button.addEventListener("click", copy);
      block.appendChild(button);
      return () => {
        button.removeEventListener("click", copy);
        button.remove();
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
