# 岩笺 · macOS 风格桌面笔记前端

React + TypeScript + React Router + lucide-react + CSS Modules。笔记的新建、列表、详情、保存和删除已接入 Rock 编写的 FastAPI + SQLite；数据访问集中在 src/api/index.ts，界面保留既有四栏布局。

## 本地运行

在后端目录的终端启动 FastAPI：

```sh
cd /Users/gaoyan/Documents/Codex/2026-10-06/fastapi-learning
.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

在另一个终端启动前端（已有服务运行时不必重复启动）：

```sh
cd /Users/gaoyan/Documents/Codex/2026-10-06/fastapi-learning/macos-notes-frontend
npm install
npm run dev
```

访问 http://127.0.0.1:5173/ 。数据库为空时显示“创建第一篇笔记”；已有笔记时打开最近更新的一篇。后端文档位于 http://127.0.0.1:8000/docs 。旧的后端根路径不是这个 React 应用的入口。

Vite 开发代理将 /api 请求转发到 http://127.0.0.1:8000，前端不硬编码数据库或后端绝对地址。可通过环境变量 ROCK_API_TARGET 覆盖代理目标，测试即使用独立目标。该代理属于开发服务；生产部署或 npm run preview 需另外配置 API 反向代理。

## 当前功能与边界

- 新建、列表、详情和保存：真实 HTTP + SQLite，服务器生成编号与更新时间；保存成功以后，刷新和后端重启仍保留数据。
- 删除：编辑器“删除笔记”按钮经明确永久删除确认后调用真实DELETE；取消不发请求。服务器204确认后清理笔记/草稿/文件树，跳转其他笔记或空入口；等待时禁用重复操作，404或断线时保留当前输入并显示错误，无回收站。
- 目录：按真实笔记的 notebook 字段在前端分组；目前新建均放入收件箱，尚无文件夹编辑或移动接口。
- 搜索、标签计数与筛选：从真实 GET /api/notes 结果在前端计算。查询忽略空白，字符必须按输入顺序出现，允许中间隔字；标题与正文分别匹配，英文不区分大小写。不是服务端搜索，也没有新增标签编辑功能。
- 草稿：切换笔记保留；保存失败保留，只有服务器确认成功才清理。未保存的草稿不承诺跨刷新保留。
- 反链与关系图：分析待接入，只显示真实中心笔记；不再展示虚构笔记或假关联。
- 偏好：字号与行号仅在当前页面会话生效。云同步仍明确标为模拟，不连接云端。
- Markdown 安全预览：支持标题、段落、引用、列表和 [[id|名称]]；React 转义文本，不解析 HTML，也不声称完整 Markdown 支持。
- 服务不可用、404、422 均显示错误；不会退回 mock 数据或假报保存成功。

## 数据访问约定

| 函数 | 当前数据来源 |
| --- | --- |
| listNotes | GET /api/notes，query/tag 在前端筛选 |
| getNote | GET /api/notes/:id |
| createNote | POST /api/notes，提交 title，返回201和完整 Note |
| updateNote | PATCH /api/notes/:id，同时提交 title/content |
| deleteNote | DELETE /api/notes/:id，无请求体；成功204无响应体，不存在404 |
| getNotebooks / notesToTree | 真实笔记按 notebook 分组，不调用 /api/notebooks |
| getTags | 真实笔记 tags 聚合，不调用 /api/tags |
| getBacklinks / getGraph | 待接入；空反链占位与真实中心节点 |
| getPreferences / updatePreferences | 当前页面会话内存 |
| syncNotes | 模拟，不连接云端 |

Note 六字段保持 id/title/content/tags/notebook/updatedAt。HTTP 失败会抛错，由页面显示；204在公共请求层提前返回，不调用response.json()。src/mocks/data.ts 保留为历史示例，当前笔记数据不再读取它；仅复用其中的偏好默认值。

## 文件与修改位置

- src/api/index.ts：真实 HTTP、错误转换及前端分组/筛选适配。
- src/state/NotesContext.tsx：服务器笔记、草稿、保存响应与文件树状态。
- src/pages/NotesHome.tsx：空数据库入口、最近笔记跳转和连接失败重试。
- src/pages/EditorPage.tsx：读取、编辑、保存、永久删除确认及显示服务器返回的时间。
- src/components/：既有四栏窗口、递归文件树、安全预览与反链占位。
- vite.config.ts：开发代理；playwright.config.ts：独立端到端测试端口。
- tests/fixtures.ts 与 tests/run-backend.py：每项测试独立临时数据库，可停止/重启临时后端；这些是测试支持代码，不是产品后端。
- docs/SOURCE_CODE.md：当前配置、源码和锁文件汇总，不参与构建。

## 验证

```sh
npm run build
npm test
```

npm test 使用本机 Google Chrome、已有后端 .venv，以及专用前端15173/后端18000端口。每项测试创建独立临时目录，并在导入应用前隔离旧资料模块的相对路径和笔记 DB_PATH；不复用个人服务或写入个人数据库。测试端口被占用时应先释放，不会自动连接其他服务。没有 Chrome 时需调整 Playwright 浏览器配置。

2026-10-19（顺序搜索变更前）：TypeScript 检查与 Vite 构建通过；九项真实 Chrome 联调测试通过，覆盖空库新建201与六字段、文件树/历史/草稿、保存后刷新与后端进程重启仍保留、422和服务中断保留草稿后恢复、真实笔记搜索/标签视图与模拟范围、404/未知页/连接恢复、390px窄屏。测试中的数据库均为临时数据。这是开发环境的真实API联调验证，不代表生产部署、云同步或反链分析完成。

## 删除功能验收（2026-10-19）

Rock完成数据库删除和DELETE接口：成功返回True、不存在抛ValueError，接口将ValueError转换为404；装饰器status_code=204且没有response_model。当前FastAPI 0.142.2会清空204响应体，直接返回数据库结果的写法已通过实测，无需强制显式Response。此前bool响应模型与204冲突的配置已修复。

老师只改前端：公共请求支持204空响应、deleteNote适配、成功后清理共享笔记与草稿、永久删除确认、处理中禁用操作、失败保留草稿、跳转另一篇/空入口，并修复“文档”导航记住已删除编号的问题。没有代改Python产品核心。

实际npm run build通过。临时本机HTTP服务10项检查通过，包含真实204且零字节、已删详情404、重复/未知删除404、其他笔记保留、列表同步、OpenAPI契约及新SQLite连接可见删除。Chrome首轮14项中13项通过，剩余一项因测试工具无法读取204响应体失败；移除不适用的浏览器body读取后，仅重跑该项通过（4.0秒），产品代码未再修改。全部14个场景均已通过验证，不声称在修正后重新跑过全量。四项新增删除场景包含取消、防重复、重启持久化/搜索移除、最后一篇空入口与导航、服务中断重试、跨页面已删404且草稿保留。所有写入测试均使用临时数据库，未使用个人笔记。

## 参考来源与代码归属

仅参考布局与交互思路，**没有复制或拉取这些项目的业务代码，也没有引入它们的后端依赖**。所有本项目组件与样式均独立编写。

- 思源笔记：[siyuan-note/siyuan](https://github.com/siyuan-note/siyuan)。阅读参考路径 [`app/src/layout/index.ts`](https://github.com/siyuan-note/siyuan/blob/master/app/src/layout/index.ts)，关注分栏及嵌套布局的组织。
- Joplin：[laurent22/joplin](https://github.com/laurent22/joplin)。阅读参考路径 [`packages/app-desktop/gui/NoteList/NoteList2.tsx`](https://github.com/laurent22/joplin/blob/dev/packages/app-desktop/gui/NoteList/NoteList2.tsx)，关注文档列表和当前选择的组织。本项目未复用其虚拟列表、插件或数据库实现。
- React Router：依据[官方嵌套路由说明](https://reactrouter.com/start/declarative/routing)使用父路由、子路由和 `Outlet`。

引用源文件在 2026-10-14 核对；链接指向上游分支，未来可能变化。依赖版本锁定在 package-lock.json。展示项目时应如实说明：前端由 Codex 按 Rock 的界面要求协助实现，后端与数据库核心由 Rock 实现，前端及联调由 Codex 协助；当前完成范围见本页。


## 中文输入验证（2026-10-19）

实际复现搜索框拼音组合中 n → ni 被错误拼成 nni。根因是受控输入每次变化直接更新 URL 搜索参数，路由更新打断浏览器组合输入。现在输入框先同步本地字符串，composition 期间不更新 URL，选词结束再发布查询；普通输入和地址栏查询恢复仍保留。

新增 tests/ime.spec.ts：用 Chrome 原生 Input.imeSetComposition / Input.insertText 产生 compositionstart/update/end，验证标题、正文的中文提交/保存/刷新，以及搜索拼音组合期间 URL 不变、选词后中文查询正确。修复前1通过1失败，修复后连同原七项共九项通过，构建通过。这是浏览器组合输入协议验证，不等同于实际操作 macOS 输入法候选窗口；用户具体输入位置和浏览器仍待反馈。之前直接填入中文的测试不足以覆盖该问题。

## 顺序搜索更新（2026-10-19）

Rock澄清要求是按输入语序匹配，允许笔记中间夹着其他字符，不是空格拆词后任意词命中。当前实现忽略查询空白，每个查询字符依次在标题或正文中匹配；标题、正文分别计算，不跨字段拼接。每个查询字符都必须出现，相同字符需要足够次数，不支持错字替换。

例如正文“今天好开心 aaa”：查询“今天 a”“今开a”均命中，“a 今天”“今天 z”“今天 aaaa”不命中。空白查询返回全部，标签筛选保留。

本轮构建通过，只重跑与变更相关的三项Chrome测试，均通过：顺序匹配正反例、中文搜索组合输入、既有真实笔记搜索/标签视图。新增tests/search.spec.ts；本轮未重跑此前全部九项。所有写入仍仅使用临时数据库，产品后端未修改。

## 历史验证（2026-10-14，纯 mock 阶段）

- `npm run build` 通过：TypeScript 严格检查和 Vite 生产构建成功。
- `npm test` 的七项 Chrome 端到端测试全部通过，覆盖共享布局与历史导航、递归树与侧栏空间、草稿/保存/刷新恢复/安全显示、搜索与标签、新建/设置/模拟同步、关系图键盘跳转与不存在路径、390px 窄屏布局。
- 本机访问 <http://127.0.0.1:5173/> 返回 HTTP 200。截图见 `docs/preview-desktop.png` 和 `docs/preview-mobile.png`。
- 这些是纯前端 mock 验证，不代表真实 API、数据库、云同步或部署已经完成。
