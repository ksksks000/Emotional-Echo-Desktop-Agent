# MoodSync 情绪回声

> 写下此刻的心情，让它变成一首歌，留给未来的自己。

MoodSync 是一个**本地优先的情绪日记**：AI 读取日记中的情绪与场景，为这一刻推荐一首贴合的 BGM，并以音乐卡片的形式留在日记里。它不评判、不说教，只提供回声。

当前仓库包含一个可运行的 **Web 原型**；桌面 Agent 版本处于设计阶段。

---

## 项目状态

| 部分 | 状态 |
|---|---|
| Web 原型（日记 + AI 寻曲） | ✅ 可运行，Mock 模式下开箱即用 |
| 桌面 Agent 版本 | 📝 设计完成，尚未实现（见 [AGENT_DESIGN.md](./AGENT_DESIGN.md)） |
| 产品定位与市场判断 | 📄 已记录（见 [PRODUCT_IDEA.md](./PRODUCT_IDEA.md)） |

---

## 功能

### 已实现

- **富文本日记**：Tiptap 编辑器，支持标题、粗体、斜体、引用、有序 / 无序列表
- **自动保存**：输入即写入浏览器 IndexedDB
- **日记管理**：列表、搜索、删除，按更新时间排序
- **情绪分析**：调用 AI 提取情绪、场景与音乐标签，并自动为日记打标签
- **寻找 BGM**：取当前段落 → 分析情绪 → 检索歌曲 → 弹窗推荐，可试听、可插入
- **音乐卡片**：以自定义 Tiptap 节点嵌入日记，记录当时的歌曲
- **迷你播放器**：底部播放器，支持进度条与播放 / 暂停
- **本地备份**：一键导出 / 导入 JSON，数据不离开浏览器
- **暗色暖金 UI**：毛玻璃、动画与衬线排版

### 规划中（桌面 Agent）

- 桌面壳、托盘、推荐浮窗
- 本地记忆：情绪时间线、向量检索、偏好学习
- Agent 工具调用与可观测 Trace
- 主动推荐（带打扰预算）与场景评测
- 播放器适配器（网页搜索 / 本地播放器 / 实验性网易云）

---

## 产品理念

- **AI 退到幕后**：界面是一本日记，不是聊天框
- **AI 只建议，用户有最终解释权**：情绪标签可修改、可清空
- **本地优先**：日记是最私密的数据，默认不上传
- **音乐是回声，不是装饰**：推荐服务于"被理解"，而不是曲库规模

更多思考见 [PRODUCT_IDEA.md](./PRODUCT_IDEA.md)。

---

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16（App Router / Turbopack）、React 19 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| 编辑器 | Tiptap 2 |
| 状态管理 | Zustand |
| 本地存储 | Dexie（IndexedDB） |
| 图标 | lucide-react |
| AI | OpenAI 兼容接口（可替换为任意兼容服务） |
| 音乐 | 网易云音乐 API（可选，自建服务） |

---

## 快速开始

### 环境要求

- Node.js ≥ 20
- npm / pnpm / yarn 任选

### 安装与运行

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 构建

```bash
npm run build
npm start
```

### 环境变量

复制 `.env.local.example`（或直接创建 `.env.local`）：

```bash
# AI API 配置（留空时使用关键词 Mock 模式）
AI_API_KEY=
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini

# 网易云音乐 API 地址（可选）
NETEASE_API_URL=http://localhost:3001
```

| 变量 | 必填 | 说明 |
|---|---|---|
| `AI_API_KEY` | 否 | 留空时走内置关键词 Mock，不会发起外部请求 |
| `AI_API_URL` | 否 | OpenAI 兼容的 Chat Completions 地址 |
| `AI_MODEL` | 否 | 模型名称，默认 `gpt-4o-mini` |
| `NETEASE_API_URL` | 否 | 自建 NeteaseCloudMusicApi 地址；不可用时回退 Mock 歌曲 |

> `.env*` 已被 `.gitignore` 忽略，请勿提交密钥。

---

## 使用流程

1. 点击首页右上角「写日记」，开始记录
2. 写下此刻的心情
3. 光标停在想配乐的段落后，点击工具栏「寻找 BGM」
4. 查看 AI 提取的情绪与标签，试听并选择一首
5. 点击「+」把歌曲插入为音乐卡片
6. 回到首页，随时搜索、回看或导出备份

---

## 项目结构

```text
.
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                 # 首页：日记列表
│  │  ├─ diary/new/page.tsx       # 新建日记并跳转
│  │  ├─ diary/[id]/page.tsx      # 日记编辑页
│  │  └─ api/
│  │     ├─ ai/analyze/route.ts   # 情绪分析接口
│  │     └─ music/               # 歌曲搜索与详情
│  ├─ components/
│  │  ├─ diary/                  # 列表与卡片
│  │  ├─ editor/                 # 编辑器、音乐卡片、找 BGM
│  │  ├─ player/                 # 迷你播放器
│  │  └─ recommend/              # 推荐弹窗
│  ├─ extensions/music-card.ts   # Tiptap 自定义节点
│  ├─ lib/
│  │  ├─ db.ts                   # Dexie 数据层
│  │  ├─ prompt.ts               # 情绪分析提示词
│  │  └─ utils.ts
│  ├─ services/                  # AI / 音乐 / 备份服务
│  ├─ stores/                    # Zustand 状态
│  └─ types/                     # 类型定义
├─ AGENT_DESIGN.md               # 桌面 Agent 设计稿
├─ PRODUCT_IDEA.md               # 产品定位与市场判断
├─ AGENTS.md                     # 项目开发约定
└─ CLAUDE.md
```

---

## 当前限制

项目仍在早期阶段，请以"可运行原型"而非"成品"看待：

- **AI 需要自配 Key**：未配置时仅支持 8 类关键词匹配，其余文本一律返回「平静」
- **音乐服务未内置**：需要自行启动网易云音乐 API 服务，否则回退 Mock 歌曲
- **Mock 歌曲没有音频**：`previewUrl` 为空，播放按钮不会出声
- **已知缺陷**：真实搜索接口把 `previewUrl` 指向了返回 JSON 的详情接口，而播放器直接把它当作音频地址，导致真实模式下也无法播放；修复时需要先调用详情接口获取真实音频 URL
- **数据仅存本地**：日记保存在浏览器 IndexedDB，清理站点数据会丢失，请定期导出备份
- **无账号与云同步**：不支持多设备
- **桌面 Agent 尚未实现**：相关能力目前只是设计

---

## 路线图

### Web 原型

- 修复音乐播放链路（搜索 → 详情 → 真实音频 URL）
- 增加更多可播放音源或平台外链
- 完善示例数据与空状态引导

### 桌面 Agent（详见 [AGENT_DESIGN.md](./AGENT_DESIGN.md)）

- v0.1：Electron 壳 + SQLite + Mock 模型 + Trace 面板
- v0.2：真实模型、本地曲库、播放器适配器、反馈落库
- v0.3：记忆检索（向量 + FTS + RRF）
- v0.4：主动推荐与打扰预算
- v0.5：场景评测与安全用例
- v1.0：可安装、可演示、可开源发布

---

## 文档

- [PRODUCT_IDEA.md](./PRODUCT_IDEA.md)：产品定位、用户、边界、市场判断、验证方案
- [AGENT_DESIGN.md](./AGENT_DESIGN.md)：桌面 Agent 架构、记忆、工具、评测与里程碑
- [AGENTS.md](./AGENTS.md)：开发约定（修改代码前请先阅读）

---

## 数据与隐私

- 日记默认只保存在本机浏览器的 IndexedDB 中
- 使用 AI 功能时，仅当前文本会发送至你配置的模型服务
- 未配置 AI Key 时不会发起任何外部 AI 请求
- 音乐搜索会请求你配置的网易云 API 地址
- 项目不包含遥测代码

---

## 许可证

MIT（如有调整会在仓库中更新 LICENSE 文件）。

---

## 贡献与反馈

这是一个个人项目，欢迎通过 Issue 讨论产品方向、Agent 设计与实现问题。

如果这个想法对你有启发，欢迎 Star 或分享你的情绪回声体验。
