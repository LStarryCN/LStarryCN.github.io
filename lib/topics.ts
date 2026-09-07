export type TopicDefinition = {
  segments: string[];
  title: string;
  description: string;
  category: string;
  subcategory?: string;
};

export const topics: TopicDefinition[] = [
  { segments: ["algorithm"], title: "算法", description: "算法思考、题解与方法总结", category: "算法" },
  { segments: ["algorithm", "string"], title: "字符串", description: "字符串算法与文本处理记录", category: "算法", subcategory: "字符串" },
  { segments: ["algorithm", "data-structure"], title: "数据结构", description: "数据结构的实现、应用与分析", category: "算法", subcategory: "数据结构" },
  { segments: ["algorithm", "graph"], title: "图论", description: "图算法、建模方法与题目记录", category: "算法", subcategory: "图论" },
  { segments: ["algorithm", "dp"], title: "动态规划", description: "状态设计、转移思路与优化方法", category: "算法", subcategory: "动态规划" },
  { segments: ["algorithm", "math"], title: "数学", description: "程序设计中的数学方法与推导", category: "算法", subcategory: "数学" },
  { segments: ["dev"], title: "开发", description: "语言、工具与软件工程实践", category: "开发" },
  { segments: ["dev", "cpp"], title: "C++", description: "C++ 学习与开发记录", category: "开发", subcategory: "C++" },
  { segments: ["dev", "java"], title: "Java", description: "Java 学习与开发记录", category: "开发", subcategory: "Java" },
  { segments: ["dev", "python"], title: "Python", description: "Python 学习与开发记录", category: "开发", subcategory: "Python" },
  { segments: ["dev", "ai"], title: "AI", description: "人工智能学习、实验与工具记录", category: "开发", subcategory: "AI" },
  { segments: ["learning"], title: "学习", description: "持续学习过程中的笔记与阶段记录", category: "学习" },
  { segments: ["learning", "notes"], title: "学习笔记", description: "系统整理的学习笔记", category: "学习", subcategory: "学习笔记" },
  { segments: ["learning", "log"], title: "学习记录", description: "长期学习过程与阶段复盘", category: "学习", subcategory: "学习记录" },
  { segments: ["projects"], title: "项目", description: "项目实践、技术选型与复盘", category: "项目" },
  { segments: ["essay"], title: "随笔", description: "技术之外的观察、思考与记录", category: "随笔" },
];

export function getTopic(segments: string[]) {
  const key = segments.join("/");
  return topics.find((topic) => topic.segments.join("/") === key);
}
