---
title: 从 RNN 到 Attention：固定长度上下文为何不够
description: 从序列翻译的瓶颈出发，理解循环状态、编码器—解码器和早期 Attention 的作用。
date: 2026-09-18
category: 开发
subcategory: AI
tags:
  - RNN
  - Attention
series: AI 与 LLM 学习路线
seriesOrder: 5
seriesSlug: ai-llm-foundations
---

考虑把一句较长的话翻译成另一种语言。早期的编码器—解码器做法让编码器逐词读入原文，把最后的隐藏状态交给解码器。解码器每生成一个词都依赖这个状态。问题是：原文中有关某个专有名词的信息，必须一路保存在有限维的状态里，才能在较晚的位置被使用。

## 循环状态的代价

典型 RNN 写作 $h_t=f(x_t,h_{t-1})$。$h_t$ 依赖上一步 $h_{t-1}$，所以同一条序列的时间步通常不能完全并行。长距离信息还要跨越许多状态传递；梯度可能消失或爆炸。LSTM、GRU 的门控结构缓解了信息保留问题，但没有消除逐步计算的依赖。

注意这不是说“RNN 永远记不住长句”，而是**只把整句压缩为一个固定向量会形成信息瓶颈**。早期的注意力机制让解码器在生成第 $t$ 个词时，直接读取编码器各位置的状态 $h_1,\ldots,h_n$：

$$
e_{t,i}=\operatorname{score}(s_{t-1},h_i),\quad
\alpha_{t,i}=\operatorname{softmax}_i(e_{t,i}),\quad
c_t=\sum_i\alpha_{t,i}h_i
$$

$s_{t-1}$ 是解码器当前的查询状态，$\alpha_{t,i}$ 是对原文第 $i$ 个位置的权重，$c_t$ 是本次生成使用的上下文。不同输出位置可以得到不同的 $c_t$：生成专有名词时，模型有机会参考对应的原文片段，而不必只依靠最后一个编码状态。

## 从跨序列查询到序列内部查询

上述注意力中，查询来自解码器，候选信息来自编码器；后来 Transformer 里的 **Self-Attention** 把查询、键和值都从同一条序列的表示中投影出来，让序列内部的位置直接交换信息。它也让训练阶段的整段序列计算更容易并行，但要存储位置之间的成对关系，长序列时成本较高。

因此，Attention 的历史线索不是“RNN 完全没用”，而是：固定上下文不够灵活，显式检索序列中的位置更合适。下一篇会具体拆开 [Self-Attention 的 Q、K、V](/posts/self-attention-from-scratch/)。

参考：[Bahdanau 等人的神经机器翻译论文](https://arxiv.org/abs/1409.0473)、[Attention Is All You Need](https://arxiv.org/abs/1706.03762)。
