---
title: PyTorch 训练循环里每一步在做什么
description: 用小型二分类数据说明 Tensor、Dataset、DataLoader、自动微分与优化器的边界。
date: 2026-09-17
category: 开发
subcategory: AI
tags:
  - PyTorch
  - 模型训练
series: AI 与 LLM 学习路线
seriesOrder: 4
seriesSlug: ai-llm-foundations
---

从数学式 $\theta\leftarrow\theta-\eta\nabla_\theta L$ 到代码，中间要处理数据分批、模型状态、梯度缓存。下面的例子故意只用一个线性层：目标是看清训练循环，而不是追求复杂模型。

```python
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(7)
x = torch.tensor([[-2., -1.], [-1., -2.], [1., 2.], [2., 1.]])
y = torch.tensor([[0.], [0.], [1.], [1.]])
loader = DataLoader(TensorDataset(x, y), batch_size=2, shuffle=True)

model = nn.Linear(2, 1)  # 输出 logits；BCEWithLogitsLoss 内部处理 sigmoid
loss_fn = nn.BCEWithLogitsLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

model.train()
for epoch in range(30):
    for batch_x, batch_y in loader:
        logits = model(batch_x)         # forward: (2, 2) -> (2, 1)
        loss = loss_fn(logits, batch_y) # 与同形状标签比较
        optimizer.zero_grad()           # 清掉上一批累积在参数上的梯度
        loss.backward()                 # 计算当前批次的梯度
        optimizer.step()                # 按优化规则修改参数

model.eval()
with torch.no_grad():
    probability = torch.sigmoid(model(torch.tensor([[1., 1.]])))
    print(probability.item())
```

`TensorDataset` 按索引把特征与标签配对；`DataLoader` 负责分批和打乱。`nn.Linear` 管理参数，`loss.backward()` 只计算梯度，`optimizer.step()` 才写入新的参数值。PyTorch 默认将梯度累加到参数的 `.grad`，所以每批都要清零。使用 `BCEWithLogitsLoss` 时不应在传给损失函数之前再手动 `sigmoid`。

## 训练结果怎么看

这四个点只是可运行的形状示例，打印值不能当作可信的泛化指标。真实任务至少应把验证集与训练集分开；评估时调用 `model.eval()`，并用 `torch.no_grad()` 避免记录不必要的梯度。`eval()` 会切换 Dropout、BatchNorm 等层的行为，它并不代替 `no_grad()`。训练数据的预处理规则也必须原样应用到验证数据，不能在验证集上重新拟合归一化统计量。

训练循环搭好之后，更重要的选择变成**模型怎样表示输入之间的关系**。处理序列时，这会引出下一篇 [从 RNN 到 Attention](/posts/rnn-to-attention/)。

参考：[PyTorch `Dataset` 与 `DataLoader`](https://docs.pytorch.org/tutorials/beginner/basics/data_tutorial.html)、[优化模型参数](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html)。
