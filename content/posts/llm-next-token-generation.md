---
title: 大语言模型怎样一个 Token 一个 Token 生成文本
description: 从自回归目标到 logits、采样、停止条件，区分训练并行与推理逐步生成。
date: 2026-09-22
category: 开发
subcategory: AI
tags:
  - LLM
  - 文本生成
series: AI 与 LLM 学习路线
seriesOrder: 9
seriesSlug: ai-llm-foundations
---

输入“请解释梯度下降”后，生成式语言模型并不先写好完整答案再逐字显示。以自回归模型为例，它反复计算“在已有 token 之后，下一个 token 的概率分布是什么”。一轮选出一个 token，接到上下文末尾，再计算下一轮。

## 训练目标与生成过程

给定 token 序列 $x_1,\ldots,x_T$，自回归分解为：

$$
p(x_1,\ldots,x_T)=\prod_{t=1}^{T}p(x_t\mid x_1,\ldots,x_{t-1})
$$

训练时，目标序列已经给出，可用因果 mask 在一次前向计算中得到多个位置的预测，并对正确的下一个 token 计算交叉熵。模型的参数按整个批次的误差更新。推理时未来 token 尚不存在，所以输出仍需逐轮产生；“训练可并行”和“生成可并行”说的是两件不同的事。

每轮模型输出词表大小为 $V$ 的 logits，softmax 转成概率。选取方式决定生成风格：贪心解码拿最大概率项，随机采样按分布抽取，温度 $\tau>0$ 则先用 $z_i/\tau$ 调整 logits。低温让分布更集中，高温让它更平坦；温度不改变模型学到的知识，也不保证事实正确。

下面的函数只演示**已得到 logits 之后**的采样，不包含模型前向计算：

```python
import numpy as np

def sample_next(logits, temperature=1.0, top_k=None, seed=0):
    if temperature <= 0:
        raise ValueError("temperature must be positive")
    scores = np.asarray(logits, dtype=float) / temperature
    if top_k is not None:
        if not 1 <= top_k <= scores.size:
            raise ValueError("top_k out of range")
        keep = np.argpartition(scores, -top_k)[-top_k:]
        masked = np.full_like(scores, -np.inf)
        masked[keep] = scores[keep]
        scores = masked
    weights = np.exp(scores - scores.max())
    probs = weights / weights.sum()
    return np.random.default_rng(seed).choice(scores.size, p=probs)

print(sample_next([1.2, 2.4, -0.5], top_k=2))
```

真实生成会维持一个随机数生成器贯穿多轮，而非每轮重置同一个种子。循环还需要明确停止条件：遇到结束 token、达到最大生成长度，或触及应用定义的其他限制。输入长度与已生成长度共同占用上下文窗口；超过模型支持的范围时，应用必须截断、摘要或采用别的上下文管理策略。

## 概率不是可信度

模型把前文映射到下一 token 的分布，较高概率只能说明这个续写在模型分布下更可能出现，不能证明其中的事实。对需要依据外部资料回答的问题，应把证据放进上下文并检查引用是否对应原文。下一篇 [RAG 的检索链路](/posts/rag-retrieval-pipeline/) 正是围绕这个工程需求展开。

参考：[GPT-2 技术报告](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)、[Transformer 原论文中的因果解码器](https://arxiv.org/abs/1706.03762)。
