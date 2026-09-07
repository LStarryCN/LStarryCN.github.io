import { CalendarClock, Clock3, Code2, FileText, FolderTree } from "lucide-react";
import { CurrentTime } from "@/components/CurrentTime";

export function SiteDashboard({ posts, categories }: { posts: number; categories: number }) {
  const items = [
    { icon: <CalendarClock size={19} />, label: "建站时间", value: "2026.09" },
    { icon: <FileText size={19} />, label: "文章", value: String(posts) },
    { icon: <FolderTree size={19} />, label: "分类", value: String(categories) },
    { icon: <Clock3 size={19} />, label: "当前时间", value: <CurrentTime /> },
    { icon: <Code2 size={19} />, label: "技术栈", value: "Next.js" },
  ];

  return (
    <section className="dashboard glass-card" aria-label="站点状态">
      <h2 className="dashboard-title">站点概览</h2>
      <div className="dashboard-grid">
        {items.map((item) => (
          <div className="dashboard-item" key={item.label}>
            <span>{item.icon}</span>
            <div><small>{item.label}</small><strong>{item.value}</strong></div>
          </div>
        ))}
      </div>
    </section>
  );
}
