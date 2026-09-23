---
title: 从矩阵形状理解 Self-Attention
description: 推导 Q、K、V、缩放点积、mask 和复杂度，并用 NumPy 实现单头注意力。
date: 2026-09-19
category: 开发
subcategory: AI
tags:
  - Self-Attention
  - Transformer
series: AI 与 LLM 学习路线
seriesOrder: 6
seriesSlug: ai-llm-foundations
---

[前一篇](/posts/rnn-to-attention/) 讲了“在生成某个位置时查看其他位置”的动机。Self-Attention 把这件事写成矩阵运算。设序列长度为 $n$，每个位置的输入表示是 $d_{model}$ 维，组成 $X\in\mathbb R^{n\times d_{model}}$。

三个可学习投影产生 $Q=XW_Q$、$K=XW_K$、$V=XW_V$。可以把 Query 理解成“当前位置想找什么”，Key 是“每个位置可用来匹配的索引”，Value 是“真正被汇总的信息”。这种说法只是帮助记忆；$Q,K,V$ 都是训练得到的向量，并没有人为规定某个维度对应某个语法角色。

## 从分数到输出

若 $Q,K\in\mathbb R^{n\times d_k}$、$V\in\mathbb R^{n\times d_v}$，则 $QK^\top$ 的形状是 $(n,n)$，第 $i$ 行给出位置 $i$ 对所有位置的匹配分数。逐行 softmax 后与 $V$ 相乘：

$$
\operatorname{Attention}(Q,K,V)
=\operatorname{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}+M\right)V
$$

$M$ 可选。需要禁止的位置设为负无穷，softmax 后权重为零。解码器的因果 mask 禁止位置 $i$ 看到 $j>i$，否则训练时会偷看目标 token。填充位置也可以用 mask 排除。

为什么除以 $\sqrt{d_k}$？如果 Q、K 各分量近似独立、均值为 0、方差为 1，它们点积的方差约为 $d_k$。维度越大，未缩放的分数越容易把 softmax 推向饱和区，使梯度变小。缩放是控制分数尺度的设计，并非强制每个点积落在某个区间。

## 单头的最小实现

```python
import numpy as np

def attention(q, k, v, causal=False):
    # q: (n, d_k), k: (n, d_k), v: (n, d_v)
    scores = q @ k.T / np.sqrt(q.shape[-1])
    if causal:
        scores = np.where(np.tril(np.ones(scores.shape, dtype=bool)),
                          scores, -np.inf)
    scores = scores - scores.max(axis=-1, keepdims=True)
    weights = np.exp(scores)
    weights /= weights.sum(axis=-1, keepdims=True)
    return weights @ v

x = np.array([[1., 0.], [0., 1.], [1., 1.]])
print(attention(x, x, x, causal=True).shape)  # (3, 2)
```

这里直接令 $Q=K=V=X$ 只为展示计算；实际层有独立投影矩阵。每一行至少可见当前位置，因此示例的因果 softmax 不会出现全被屏蔽的行。对一般 mask 实现，还需处理全遮蔽行的数值行为。

计算 $QK^\top$ 需要约 $O(n^2d_k)$ 次运算，注意力矩阵需要 $O(n^2)$ 空间；再乘 $V$ 约为 $O(n^2d_v)$。这解释了长上下文的压力。它与 RNN 的根本差别在于：一个注意力层可直接连接任意两个位置，训练时各查询位置可并行计算；RNN 状态则沿时间步递推。

参考：[Transformer 原论文，第 3.2 节](https://arxiv.org/abs/1706.03762)。
