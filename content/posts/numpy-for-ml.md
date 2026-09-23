---
title: 用 NumPy 的形状读懂一个线性分类器
description: 以批量线性分类为例，理解矩阵乘法、广播、axis 与稳定 softmax。
date: 2026-09-15
category: 开发
subcategory: AI
tags:
  - NumPy
  - 机器学习
series: AI 与 LLM 学习路线
seriesOrder: 2
seriesSlug: ai-llm-foundations
---

机器学习代码里最值得先看的往往不是算法名，而是数组的形状。假设一批数据有 $B$ 个样本，每个样本有 $D$ 个特征，要分成 $C$ 类：输入 $X$ 的形状是 $(B,D)$，权重 $W$ 是 $(D,C)$，偏置 $b$ 是 $(C,)$。

$$
Z=XW+b,\qquad Z\in\mathbb{R}^{B\times C}
$$

矩阵乘法使每个样本与每一类的权重相乘求和。加偏置时，NumPy 按末尾维度对齐，把 $(C,)$ 广播到 $(B,C)$；这里无需手动复制 $B$ 份。**广播描述的是运算规则，不保证所有形状都能自动匹配。**比如 $(B,D)$ 与 $(B,)$ 通常就不能按“每行加一个数”的意图直接相加，应写成 `row_bias[:, None]`。

## 一个可检查形状的例子

```python
import numpy as np

X = np.array([[2., 0., 1.], [0., 1., 3.]])  # (B=2, D=3)
W = np.array([[1., -1.], [0., 2.], [1., 0.]])  # (D=3, C=2)
b = np.array([0.5, -0.5])  # (C=2,)

logits = X @ W + b
shifted = logits - logits.max(axis=1, keepdims=True)
exp = np.exp(shifted)
probs = exp / exp.sum(axis=1, keepdims=True)

print(logits.shape)       # (2, 2)
print(probs.sum(axis=1))  # 每个样本的类别概率之和为 1
```

`axis=1` 表示沿类别维度归约：每一行得一个值；`keepdims=True` 保留形状 $(B,1)$，方便与 $(B,C)$ 相减或相除。这里的 softmax 写成

$$
p_{ic}=\frac{e^{z_{ic}-m_i}}{\sum_j e^{z_{ij}-m_i}},\qquad m_i=\max_j z_{ij}
$$

减去同一行的最大值不改变概率，却能避免大正数在 `exp` 时溢出。这是数值计算里比“公式看起来正确”更进一步的一层要求。

## 形状是调试线索

`*` 是逐元素相乘，`@` 才是矩阵乘法；二者即使结果形状偶然相同，含义也完全不同。`mean(axis=0)` 汇总同一特征在所有样本上的值，`mean(axis=1)` 汇总单个样本的所有特征。把 $B$、$D$、$C$ 写在注释里，通常比盯着报错猜测更快。

下一篇 [反向传播](/posts/backprop-from-linear-model/) 会继续使用 $XW+b$，推导参数为什么能从损失中得到更新方向。

参考：[NumPy 广播规则](https://numpy.org/doc/stable/user/basics.broadcasting)、[NumPy `matmul` 文档](https://numpy.org/doc/stable/reference/generated/numpy.matmul.html)。
