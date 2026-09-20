# RAG Splitter Demo

从**网页抓取**到**回答问题**的最小可用 RAG 链路，重点验证一件事：**中文文档的切分策略怎么影响召回质量**。

这个 demo 不是为了做一个完整的问答系统，是为了把 RAG 链路里最容易被忽略、又最影响结果的一环——**分块**——单独拎出来看清楚。

## 完整链路

```
CheerioWebBaseLoader   →    RecursiveCharacterTextSplitter   →    OpenAIEmbeddings
   （只取正文段落）              （中文标点切分）                    （向量化）
                                                                      ↓
                              上下文增强生成   ←   Top-K 召回   ←   MemoryVectorStore
```

## 目录结构

```
src/
├── index.mjs           # 主流程：加载 → 切分 → 向量化 → 检索 → 增强生成
├── crawl.mjs           # 单独的抓取脚本，验证 cheerio + CSS 选择器
└── test-selector.mjs   # 选择器调试脚本
```

## 关键参数与调参理由

```js
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 400,
  separators: ["。", "！", "？"],
  chunkOverlap: 100,
});
```

| 参数 | 取值 | 为什么这么定 |
|---|---|---|
| `chunkSize` | 400 | 中文技术文章一个自然段大约是这个量级。再大就会把多个不相关的话题塞进同一个向量，语义被稀释，检索反而更不准 |
| `separators` | `["。", "！", "？"]` | **这是这个 demo 最主要的坑**。LangChain 默认分隔符是按 `\n\n`、`\n`、空格、空字符串递归切的，切中文长句时会在逗号处断，一个完整的语义被切成两半 |
| `chunkOverlap` | 100 | 兜底用。如果某段通篇没标点（菜单、古文、代码块），递归分隔符全都失配，最后会硬切，靠 overlap 把上下文补回来 |

**还有一个容易被忽略的点**：`CheerioWebBaseLoader` 传了 `selector: '.main-area p'`，只取正文段落。如果不限制选择器，导航栏、评论区、推荐列表全会混进向量库，检索时干扰很大。

## 运行

```bash
pnpm install
copy .env.example .env      # 填 API Key / Base URL / 模型名
pnpm start
```

`.env` 需要四项：`OPENAI_API_KEY`、`OPENAI_BASE_URL`、`MODEL_NAME`（对话模型）、`EMBEDDINGS_MODEL_NAME`（向量模型）。

脚本会打印每个 chunk 的内容和**相似度评分**，方便直接看切分效果：

```js
const scoredResults = await vectorStore.similaritySearchWithScore(question, 3);
```

## 排错记录

仓库根目录里保留了两篇写这个 demo 时的实际排错文档（含流程图配图）：

- [`LangChain RAG 排错实录：.env 为什么没有生效`](./LangChain%20RAG%20排错实录：.env%20为什么没有生效/) —— 环境变量加载顺序问题，`dotenv/config` 的导入位置会影响已初始化模块读到的值
- [`从网页到回答：这个最小 RAG 项目学到了什么`](./从网页到回答：这个最小 RAG 项目学到了什么/) —— 切分策略与召回质量的对应关系

## 一句话结论

**召回不准的时候，先打印 Top-K 的内容和分数，确认问题出在检索还是生成。** 绝大多数情况不是 Prompt 的问题，是切分把语义切断了。
