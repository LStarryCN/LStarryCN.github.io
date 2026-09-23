---
title: 从检索链路理解 RAG，而不是只看向量数据库
description: 设计一个最小的检索增强问答流程，说明切分、召回、提示词、引用与评估各自的职责。
date: 2026-09-23
category: 开发
subcategory: AI
tags:
  - RAG
  - AI 工程
series: AI 与 LLM 学习路线
seriesOrder: 10
seriesSlug: ai-llm-foundations
---

假设要让问答程序回答某份经常更新的课程说明。把所有细节寄希望于模型参数不现实；即使模型能给出流畅答案，也未必引用了当前版本。检索增强生成（RAG）的思路是：**先从受控文档里找相关片段，再把片段连同问题交给生成模型**。检索提供证据，生成负责组织回答；两步都可能出错。

## 从文档到一次回答

离线阶段先提取文档文字，按语义边界切成带来源信息的片段，计算检索表示并建立索引。在线阶段对用户问题做同样的查询编码，取回候选片段，必要时重排，再构造带证据的提示词。答案应附上片段来源；找不到足够证据时，应允许回答“资料中没有明确说明”。

切分不能只看字符数。过短会把定义和限制条件拆开，过长会引入无关文字、挤占上下文。表格、标题和版本号也要保留下来，否则“周五之前提交”可能丢失所属课程或学期。索引更新应与原文版本同步，避免召回旧片段。

下面只展示**向量召回和提示词拼装**的接口边界。向量是假设已由同一个文本编码模型生成的示意输入；实际应用必须对文档和查询使用兼容的编码方式。

```python
import numpy as np

def retrieve(query_vector, vectors, passages, k=2):
    q = np.asarray(query_vector, dtype=float)
    x = np.asarray(vectors, dtype=float)
    if x.ndim != 2 or q.shape != (x.shape[1],) or len(passages) != len(x):
        raise ValueError("vectors and passages have incompatible shapes")
    q_norm = np.linalg.norm(q)
    x_norm = np.linalg.norm(x, axis=1)
    if q_norm == 0 or np.any(x_norm == 0):
        raise ValueError("cosine similarity needs nonzero vectors")
    scores = (x @ q) / (x_norm * q_norm)
    ids = np.argsort(scores)[-min(k, len(passages)):][::-1]
    return [(passages[i], float(scores[i])) for i in ids]

passages = ["课程甲：作业周五截止。", "课程乙：考试为闭卷。"]
vectors = [[1., 0.], [0., 1.]]  # 仅为演示计算，不能代替真实文本编码器
hits = retrieve([0.9, 0.1], vectors, passages)
context = "\n".join(f"[{i+1}] {text}" for i, (text, _) in enumerate(hits))
prompt = f"仅依据以下资料回答；资料不足时说明不足。\n{context}\n问题：课程甲何时交作业？"
print(prompt)
```

余弦相似度只是候选排序信号，不是正确性证明。这里的玩具向量只用于展示矩阵形状与检索接口，不表示实际语义。正式系统还需存储每个片段的文件名、章节、版本和权限；检索前做权限过滤，不能因为某段向量相似就把无权阅读的内容交给模型。

## 怎么知道 RAG 真有用

把故障拆开评估：检索阶段检查正确证据是否出现在 top-k；生成阶段在给定正确证据时检查回答与引用是否一致。若正确片段未被召回，改提示词通常救不了；若片段已召回却仍答错，要检查上下文编排和生成策略。文档中的指令也只是**待引用的数据**，不能提升为系统指令。这样分层排查，比把全部责任推给“向量数据库不够好”更有效。

这条路线至此把 [训练模型](/posts/pytorch-training-loop/)、[Transformer](/posts/transformer-architecture/)、[文本生成](/posts/llm-next-token-generation/) 与应用侧证据管理串了起来。后续可以再深入检索模型、重排、长上下文和微调，但先把这一条最小链路测准更有价值。

参考：[RAG 原论文](https://arxiv.org/abs/2005.11401)。
