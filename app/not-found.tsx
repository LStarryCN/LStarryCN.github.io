import { ArrowLeft, Telescope } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell not-found-page">
      <section className="glass-card empty-state">
        <span className="empty-icon"><Telescope size={34} /></span>
        <span className="section-kicker">404 · LOST IN SPACE</span>
        <h1>没有找到这个页面</h1>
        <p>链接可能已经变化，也可能这颗小行星还没有被记录。</p>
        <Link className="primary-link" href="/"><ArrowLeft size={17} /> 返回首页</Link>
      </section>
    </div>
  );
}
