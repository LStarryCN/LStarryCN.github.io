export const siteConfig = {
  name: "LStarry",
  title: "LStarry の 星屿",
  subtitle: "Code · Notes · Life",
  description: "记录算法、开发和一些日常想法。",
  role: "软件工程本科生",
  url: "https://lstarry.cn",
  github: "https://github.com/LStarryCN",
  githubName: "LStarryCN",
  locale: "zh_CN",
  buildDate: "2026-09-06T00:00:00+08:00",
  backgrounds: ["/images/backgrounds/lstarry-bg.jpg"],
  currentStatus: {
    learning: ["算法学习", "开发记录", "AI 学习"],
  },
  social: {
    github: "https://github.com/LStarryCN",
    email: "",
    bilibili: "",
  },
  navigation: [
    { label: "首页", href: "/" },
    { label: "文章", href: "/posts/" },
    {
      label: "算法",
      href: "/topics/algorithm/",
      children: [
        { label: "字符串", href: "/topics/algorithm/string/" },
        { label: "数据结构", href: "/topics/algorithm/data-structure/" },
        { label: "图论", href: "/topics/algorithm/graph/" },
        { label: "动态规划", href: "/topics/algorithm/dp/" },
        { label: "数学", href: "/topics/algorithm/math/" },
      ],
    },
    {
      label: "开发",
      href: "/topics/dev/",
      children: [
        { label: "C++", href: "/topics/dev/cpp/" },
        { label: "Java", href: "/topics/dev/java/" },
        { label: "Python", href: "/topics/dev/python/" },
        { label: "AI", href: "/topics/dev/ai/" },
      ],
    },
    { label: "项目", href: "/projects/" },
    {
      label: "学习",
      href: "/topics/learning/",
      children: [
        { label: "学习笔记", href: "/topics/learning/notes/" },
        { label: "学习记录", href: "/topics/learning/log/" },
      ],
    },
    { label: "随笔", href: "/topics/essay/" },
    { label: "关于", href: "/about/" },
  ],
} as const;
