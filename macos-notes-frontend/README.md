# 岩笺 · macOS 风格桌面笔记前端

React + TypeScript + React Router + lucide-react + CSS Modules。独立的纯前端项目；全部示例数据在 `src/mocks/`，组件只通过 `src/api/` 调用异步数据接口。

## 本地运行

安装 Node.js 22.12+（推荐 Node.js 24），在本目录运行：

```sh
npm install
npm run dev
```

访问 <http://127.0.0.1:5173/> 。默认打开 `/notes/welcome`。

```sh
npm run typecheck
npm run build
npm run preview
```

已安装 Google Chrome 时，可运行 `npm test` 执行随项目提供的端到端测试。测试配置使用本机 Chrome；没有安装 Chrome 的环境可以在 `playwright.config.ts` 移除 `channel: 'chrome'`，然后执行 `npx playwright install chromium`。

`npm run build` 先检查 TypeScript，再生成 `dist/`。Vite 仅为前端开发与预览工具，不包含 API 服务端。发布 BrowserRouter 应用时，静态托管需把未知页面路径回退到 `index.html`；否则直接刷新 `/notes/welcome` 会由托管服务器返回 404。

## 功能与操作

- 四栏窗口：56px 模块导航、220px 递归文件树、居中的最大 700px 正文、280px 反链面板。
- 顶部文件树/反链按钮隐藏或显示侧栏。桌面初始展示四栏；窄屏默认隐藏侧栏，手动打开为浮层。
- 文件夹按钮展开/折叠；文档通过 React Router 切换，激活项淡蓝高亮。
- 反链条目、关系图节点和正文 `[[id|名称]]` 链接均能打开对应文档。
- 搜索标题和正文，支持空结果；标签按实际 mock 笔记计数并筛选。
- 编辑按钮切换到 Markdown 源码，显式保存；⌘/Ctrl+S 保存，⌘/Ctrl+K 打开搜索。
- 新建按钮在收件箱创建笔记。未保存草稿按文档 id 保留，切换文档不会丢失当前输入。
- 设置可以调整正文字号、显示源码行号；模拟同步给出明确 mock 提示。
- 路由加载和失败有状态提示，未知文档和未知页面有返回入口。

**模拟保存、偏好和新建笔记仅保留在当前页面会话。刷新会恢复初始示例。没有真实同步、持久化、后端、数据库或用户登录。** 编辑器是 textarea + 安全的轻量预览，不是完整富文本编辑器。预览支持标题、段落、引用、列表和双向链接；不解析 HTML，不实现完整 Markdown 规范。

## 文件结构

```text
macos-notes-frontend/
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
├── README.md
├── tests/desktop.spec.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types.ts
│   ├── vite-env.d.ts
│   ├── api/index.ts
│   ├── mocks/data.ts
│   ├── state/NotesContext.tsx
│   ├── components/
│   │   ├── IconButton.tsx
│   │   ├── FileTree.tsx
│   │   ├── DesktopLayout.tsx
│   │   ├── BacklinksPanel.tsx
│   │   └── MarkdownPreview.tsx
│   ├── pages/
│   │   ├── EditorPage.tsx
│   │   └── UtilityPages.tsx
│   └── styles/
│       ├── global.css
│       └── Desktop.module.css
└── docs/
    └── SOURCE_CODE.md
```

`docs/SOURCE_CODE.md` 汇总项目文件结构及所有配置、源码和锁文件的完整内容；它是交付文档，不参与构建。`node_modules/`、`dist/` 和截图是依赖/生成产物，不属于手写源码。

## 后端接入约定

每个 `src/api/index.ts` 导出的函数前均标注 HTTP 方法、预期路径、参数与返回类型。后续保持函数签名和类型不变，将 mock 实现替换为 `fetch` 即可。HTTP 非成功状态应抛出 `Error`，让现有组件显示错误。以下路径仅是前端约定，没有创建任何服务端实现。

| 函数                | 预期接口                         | 返回              |
| ----------------- | ---------------------------- | --------------- |
| getNotebooks      | GET /api/notebooks           | TreeNode[]      |
| listNotes         | GET /api/notes?query=\&tag=  | Note[]          |
| getNote           | GET /api/notes/:id           | Note            |
| updateNote        | PATCH /api/notes/:id         | Note            |
| createNote        | POST /api/notes              | Note            |
| getBacklinks      | GET /api/notes/:id/backlinks | Backlink[]      |
| getGraph          | GET /api/notes/:id/graph     | GraphData       |
| getTags           | GET /api/tags                | {name,count}[]  |
| getPreferences    | GET /api/preferences         | Preferences     |
| updatePreferences | PATCH /api/preferences       | Preferences     |
| syncNotes         | POST /api/sync               | {mode,syncedAt} |

目前反链是独立 mock 关系，编辑正文不会自动重算链接。真实后端如何保存或计算链接由 Rock 决定；前端不生成 schema、ORM 或迁移文件。

## 布局与修改位置

- `DesktopLayout.tsx`：共用窗口、工具栏、模块栏、左右侧栏和路由出口。
- `FileTree.tsx`：递归节点、展开状态和文档高亮。
- `BacklinksPanel.tsx`：反链与 SVG 局部图，支持键盘打开图节点。
- `EditorPage.tsx`：加载、草稿编辑、模拟保存。
- `NotesContext.tsx`：父布局共享资料、草稿和偏好。
- `Desktop.module.css`：带中文组件注释的窗口/四栏/毛玻璃/编辑器样式。
- `api/index.ts`：唯一的数据接口适配边界。

## 参考来源与代码归属

仅参考布局与交互思路，**没有复制或拉取这些项目的业务代码，也没有引入它们的后端依赖**。所有本项目组件与样式均独立编写。

- 思源笔记：[siyuan-note/siyuan](https://github.com/siyuan-note/siyuan)。阅读参考路径 [`app/src/layout/index.ts`](https://github.com/siyuan-note/siyuan/blob/master/app/src/layout/index.ts)，关注分栏及嵌套布局的组织。
- Joplin：[laurent22/joplin](https://github.com/laurent22/joplin)。阅读参考路径 [`packages/app-desktop/gui/NoteList/NoteList2.tsx`](https://github.com/laurent22/joplin/blob/dev/packages/app-desktop/gui/NoteList/NoteList2.tsx)，关注文档列表和当前选择的组织。本项目未复用其虚拟列表、插件或数据库实现。
- React Router：依据[官方嵌套路由说明](https://reactrouter.com/start/declarative/routing)使用父路由、子路由和 `Outlet`。

引用源文件在 2026-10-14 核对；链接指向上游分支，未来可能变化。依赖版本锁定在 package-lock.json。展示项目时应如实说明：前端由 Codex 按 Rock 的界面要求协助实现，后端与数据库尚待 Rock 完成。

## 实际验证（2026-10-14）

- `npm run build` 通过：TypeScript 严格检查和 Vite 生产构建成功。
- `npm test` 的七项 Chrome 端到端测试全部通过，覆盖共享布局与历史导航、递归树与侧栏空间、草稿/保存/刷新恢复/安全显示、搜索与标签、新建/设置/模拟同步、关系图键盘跳转与不存在路径、390px 窄屏布局。
- 本机访问 <http://127.0.0.1:5173/> 返回 HTTP 200。截图见 `docs/preview-desktop.png` 和 `docs/preview-mobile.png`。
- 这些是纯前端 mock 验证，不代表真实 API、数据库、云同步或部署已经完成。
