---
title: 把 Transformer 拆成可检查的几层
description: 分清多头注意力、位置编码、前馈网络，以及原始编码器—解码器中的三种注意力。
date: 2026-09-20
category: 开发
subcategory: AI
tags:
  - Transformer
  - 模型架构
series: AI 与 LLM 学习路线
seriesOrder: 7
seriesSlug: ai-llm-foundations
---

理解了 [单头 Self-Attention](/posts/self-attention-from-scratch/) 后，仍不能把 Transformer 想成“叠几层 Attention”。原论文的模型为机器翻译设计，完整结构是**编码器栈 + 解码器栈**，每个位置还要经过前馈网络、残差连接与层归一化。

## 一层里发生什么

以编码器为例，输入先加入位置信息，然后进入多头 Self-Attention。若有 $h$ 个头，每个头使用独立的 $W_Q^{(i)},W_K^{(i)},W_V^{(i)}$，分别计算注意力，最后拼接并经过输出投影。多个头不是把同一个权重矩阵重复运行 $h$ 次；它们能学习不同的投影，但也不保证每个头一定对应可命名的语言现象。

之后的 position-wise FFN 对每个位置应用相同的两层变换：

$$
\operatorname{FFN}(x)=\max(0,xW_1+b_1)W_2+b_2
$$

它在特征维度上做非线性变换；Self-Attention 则让不同位置交换信息。残差连接给层保留一条直接传递输入和梯度的路径，LayerNorm 帮助控制激活尺度。原论文使用在子层输出之后做归一化的安排；后来的模型也常见把归一化放在子层之前，读具体模型时应看实现。

## 为什么需要位置

只看一层没有位置编码的 Self-Attention，同样的 token 表示换个顺序，输出也会随之等变，无法仅凭内容区分先后。原论文给输入加正弦、余弦位置编码；它不是唯一选择，学习式位置表示和相对位置方法也存在。关键是模型必须获得足够的顺序信息。

## 三种注意力不要混在一起

| 原论文中的位置 | Query 来自 | Key / Value 来自 | 约束 |
| --- | --- | --- | --- |
| 编码器 Self-Attention | 编码器当前表示 | 编码器当前表示 | 可看完整输入 |
| 解码器 Self-Attention | 解码器当前表示 | 解码器当前表示 | 因果 mask，不能看未来 |
| 编码器—解码器 Attention | 解码器当前表示 | 编码器输出 | 可看完整源序列 |

解码器训练时会把目标序列右移，利用前面 token 预测下一个 token；因果 mask 保证模型不会直接看到答案。生成时仍需逐个输出 token，训练阶段“位置可并行”不等于推理时整段答案能一次生成。

许多文本生成 LLM 使用**仅解码器**的变体，没有原始翻译模型里的编码器—解码器交叉注意力。说“Transformer 一定有编码器和解码器”与说“Transformer 只有 Self-Attention”都过于简单。下一篇 [Tokenizer 与 Embedding](/posts/tokenizer-and-embedding/) 会说明文本怎样变成这些层的输入。

参考：[Attention Is All You Need](https://arxiv.org/abs/1706.03762)。
