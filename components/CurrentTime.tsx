"use client";

import { useEffect, useState } from "react";

type ClockValue = {
  date: string;
  time: string;
};

const emptyClock: ClockValue = {
  date: "正在读取日期",
  time: "--:--",
};

function getShanghaiTime(): ClockValue {
  const now = new Date();
  return {
    time: new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    }).format(now),
    date: new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      timeZone: "Asia/Shanghai",
    }).format(now),
  };
}

export function CurrentTime({ detailed = false }: { detailed?: boolean }) {
  const [clock, setClock] = useState<ClockValue>(emptyClock);

  useEffect(() => {
    const update = () => setClock(getShanghaiTime());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!detailed) return <span>{clock.time.slice(0, 5)}</span>;

  return (
    <div className="live-clock" aria-live="off">
      <time className="live-clock-time">{clock.time}</time>
      <span className="live-clock-date">{clock.date}</span>
    </div>
  );
}
