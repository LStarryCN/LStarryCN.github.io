import { Inbox } from "lucide-react";

export function EmptyState({
  title = "内容正在整理中",
  description = "这里会保留清晰的入口，等真实内容准备好后再逐步补充。",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Inbox size={30} /></span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
