---
title: 从线性层到反向传播：梯度究竟从哪里来
description: 用一个两层网络推导链式法则，解释梯度、激活函数和参数更新的关系。
date: 2026-09-16
category: 开发
subcategory: AI
tags:
  - 神经网络
  - 反向传播
series: AI 与 LLM 学习路线
seriesOrder: 3
seriesSlug: ai-llm-foundations
---

在 [线性分类器](/posts/numpy-for-ml/) 中，$XW+b$ 给出了预测分数。训练时还要回答一个问题：预测错了，究竟该改 $W$ 的哪个元素，改多少？反向传播就是用链式法则高效计算这个答案；它不是另一种与梯度下降并列的优化器。

## 先看一个标量

设 $z=wx+b$，$a=\max(0,z)$，$L=(a-y)^2/2$。当 $z>0$ 时，链式法则给出：

$$
\frac{\partial L}{\partial w}
=\frac{\partial L}{\partial a}
\frac{\partial a}{\partial z}
\frac{\partial z}{\partial w}
=(a-y)\cdot 1\cdot x
$$

若 $z<0$，ReLU 在该点的导数为 0，这条路径就不给 $w$ 传递梯度；在 $z=0$ 处需约定一个次梯度，框架通常自行处理。梯度是**局部斜率**，更新 $w\leftarrow w-\eta\partial L/\partial w$ 才是沿负梯度方向移动，其中 $\eta$ 是学习率。

## 两层网络为什么要“反着算”

令隐藏层 $H=\operatorname{ReLU}(XW_1+b_1)$，输出 $\hat Y=HW_2+b_2$。前向计算先得到 $H$ 再得到 $\hat Y$；反向计算从损失对 $\hat Y$ 的导数出发，先求 $W_2$ 的梯度，再通过 $W_2$ 把误差信号传回 $H$，最后求 $W_1$。中间结果会被多个参数复用，不必为每个权重单独重算整条导数链。

可以用微小扰动检查手算梯度。下例只验证单个标量，不适合用有限差分训练整个网络：

```python
def loss(w, x=2.0, y=1.0):
    a = max(0.0, w * x)
    return 0.5 * (a - y) ** 2

w, eps = 0.75, 1e-5
numerical = (loss(w + eps) - loss(w - eps)) / (2 * eps)
analytic = (w * 2.0 - 1.0) * 2.0  # 此处 w*x > 0
print(numerical, analytic)  # 都接近 1.0
```

数值梯度是调试工具：太大的 `eps` 近似不准，太小又会受浮点误差影响。实际训练由自动微分记录张量运算图并应用链式法则。[PyTorch 训练循环](/posts/pytorch-training-loop/) 会把 `backward()` 与 `optimizer.step()` 分开看，避免把“求梯度”和“更新参数”混为一谈。

参考：[PyTorch 自动微分教程](https://docs.pytorch.org/tutorials/beginner/basics/autograd_tutorial.html)。
