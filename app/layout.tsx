import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "@hanzi.pro/webfonts-lxgw-wenkai/swap/500.css";
import "./globals.css";
import { BackgroundLayer } from "@/components/BackgroundLayer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/siteConfig";

const brand = localFont({
  src: "../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2",
  variable: "--font-brand",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · ${siteConfig.subtitle}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/images/avatar/lstarry-logo.jpeg",
    apple: "/images/avatar/lstarry-logo.jpeg",
  },
  keywords: ["软件工程", "编程", "算法", "C++", "Java", "Python", "AI", "学习笔记"],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  alternates: {
    canonical: "/",
    types: { "application/atom+xml": "/atom.xml" },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} · ${siteConfig.subtitle}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dce7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#18243a" },
  ],
};

const themeScript = `(() => { try { const saved = localStorage.getItem('lstarry-theme'); const theme = saved === 'light' || saved === 'dark' ? saved : 'light'; document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; } catch (_) {} })();`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const posts = getAllPosts();

  return (
    <html
      className={brand.variable}
      data-scroll-behavior="smooth"
      lang="zh-CN"
      suppressHydrationWarning
    >
      <head>
        <link rel="preload" href={siteConfig.backgrounds[0]} as="image" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">跳到主要内容</a>
        <BackgroundLayer />
        <div className="site-frame">
          <Header posts={posts} />
          <main id="main-content">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
