---
title: Tokenizer 和 Embedding 各自解决什么问题
description: 从字符到 token ID 再到向量，说明子词、词表、特殊 token 与上下文表示的区别。
date: 2026-09-21
category: 开发
subcategory: AI
tags:
  - Tokenizer
  - Embedding
series: AI 与 LLM 学习路线
seriesOrder: 8
seriesSlug: ai-llm-foundations
---

Transformer 接收的是向量序列，用户输入的是文本。中间至少有两步：**Tokenizer 把文本切分并映射成整数 ID；Embedding 表按 ID 查出可训练向量**。这两个步骤经常被一句“转成向量”带过，实际边界很重要。

## token 不等于词

假设词表只有固定数量的条目。整词词表遇到新词容易失效，逐字符切分又可能让序列过长。BPE、WordPiece、Unigram 等子词方法在两者之间折中：常见片段可以合并，少见词由更小单位组成。具体切分还受规范化、预分词、空格处理和词表训练方式影响。因此一个中文汉字、英文单词或标点都不保证恰好是一个 token；“一段话有多少 token”必须以目标模型的 tokenizer 实算。

例如字符串可以经过如下逻辑管线：

```text
原始文本 → 规范化/预分词 → 子词切分 → token ID → Embedding 查询
```

ID 只是词表索引，没有“编号越近语义越近”的含义。若词表大小为 $V$，隐藏维度为 $d$，Embedding 表 $E\in\mathbb R^{V\times d}$，第 $i$ 个 token 的初始表示就是 $E[i]$。这张表通过任务损失训练。位置表示随后加入或以别的形式注入，让同一个 token 在不同顺序中可被区分。

## 静态入口与上下文表示

同一个 token ID 每次查表得到同一个初始向量；经过 Transformer 后，它的隐藏状态会受上下文影响。例如“苹果”在水果和公司语境里，初始查表可相同，后续层的表示则可能不同。**Embedding 表里的向量**与**某个句子的检索向量**也不是同一概念：后者通常由专门模型对整段文本编码，供相似度检索使用。

词表还包括特殊 token，如序列结束或填充标记。训练、推理必须使用与模型权重匹配的 tokenizer；换一套词表会使 ID 的含义错位。添加新 token 也通常需要处理 Embedding 表的大小与训练方式，不能只改字符串切分规则。

下一篇 [逐 token 生成](/posts/llm-next-token-generation/) 会沿着“文本 → ID → 向量 → 下一个 ID”的路径走一遍；之后的 [RAG](/posts/rag-retrieval-pipeline/) 则会使用整段文本的检索向量。

参考：[Hugging Face Tokenizers 处理组件](https://huggingface.co/docs/tokenizers/components)、[Transformers 官方分词算法说明](https://huggingface.co/docs/transformers/main/tokenizer_summary)。
