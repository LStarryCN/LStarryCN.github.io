"use client";

import { useEffect, useState } from "react";

export function CurrentTime() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    }).format(new Date()));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return <span>{time}</span>;
}
