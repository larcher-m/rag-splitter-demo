# LangChain Mini Cursor

一个使用 Node.js 和 LangChain 实现的轻量 Agent Demo。Agent 根据任务自主规划，并通过工具完成文件和项目操作。

## 能力

- ReAct 风格的多轮工具调用
- 读取文件、写入文件、列出目录
- 执行命令并读取执行结果
- 自动生成并启动一个 React Todo 项目
- 使用 Zod 对工具参数进行约束

## 技术栈

Node.js、LangChain、OpenAI 兼容模型接口、DeepSeek、Zod、子进程和文件系统 API。

## 运行

```bash
pnpm install
copy .env.example .env
pnpm start
```

在 `.env` 中配置兼容 OpenAI API 的模型地址和密钥。具体启动入口以 `package.json` 为准。

## 说明

这是 Agent 工具编排原型。命令执行和文件写入能力需要在受控目录、权限隔离和沙箱中使用，不能直接作为生产环境执行器。
