# 岩笺前端 · 完整项目结构与文件代码

2026-10-19更新：真实笔记增查改删、中文组合输入及按顺序允许间隔的搜索。仅汇总配置、源码、测试和锁文件；不含数据库、依赖或构建产物。旧截图为mock阶段历史截图。

## 完整文件清单

```text
macos-notes-frontend/
  .gitignore
  README.md
  index.html
  package-lock.json
  package.json
  playwright.config.ts
  src/App.tsx
  src/api/index.ts
  src/components/BacklinksPanel.tsx
  src/components/DesktopLayout.tsx
  src/components/FileTree.tsx
  src/components/IconButton.tsx
  src/components/MarkdownPreview.tsx
  src/main.tsx
  src/mocks/data.ts
  src/pages/EditorPage.tsx
  src/pages/NotesHome.tsx
  src/pages/UtilityPages.tsx
  src/state/NotesContext.tsx
  src/styles/Desktop.module.css
  src/styles/global.css
  src/types.ts
  src/vite-env.d.ts
  tests/delete.spec.ts
  tests/desktop.spec.ts
  tests/fixtures.ts
  tests/ime.spec.ts
  tests/run-backend.py
  tests/search.spec.ts
  tsconfig.json
  vite.config.ts
  docs/SOURCE_CODE.md
```

## .gitignore

````text
node_modules/
dist/
.DS_Store
.env
*.log
test-results/
playwright-report/
AGENTS.md
````

## README.md

````markdown
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
````

## index.html

````html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#f5f5f7" />
    <title>岩笺</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````

## package-lock.json

````json
{
  "name": "rock-macos-notes-frontend",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "rock-macos-notes-frontend",
      "version": "1.0.0",
      "dependencies": {
        "lucide-react": "1.56.0",
        "react": "19.3.0",
        "react-dom": "19.3.0",
        "react-router-dom": "7.18.4"
      },
      "devDependencies": {
        "@playwright/test": "1.62.1",
        "@types/react": "19.3.0",
        "@types/react-dom": "19.3.0",
        "@vitejs/plugin-react": "6.1.2",
        "typescript": "7.0.2",
        "vite": "8.3.4"
      },
      "engines": {
        "node": ">=22.12.0"
      }
    },
    "node_modules/@oxc-project/types": {
      "version": "0.153.0",
      "resolved": "https://registry.npmjs.org/@oxc-project/types/-/types-0.153.0.tgz",
      "integrity": "sha512-jSNrRIyvPVLL5E1z/tS5zLAprosGz/FuI1PWwEOz59j3E4TTTzSpqKb/RDGqJhhW0QHYISGXxq582wGx6T11Tw==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/oxc-project"
      }
    },
    "node_modules/@playwright/test": {
      "version": "1.62.1",
      "resolved": "https://registry.npmjs.org/@playwright/test/-/test-1.62.1.tgz",
      "integrity": "sha512-DTcUc8qii+cpHvtOwggMtBRMjKZHXYWdw8syRYu2vtzuq4Wxphqq4NfCs5Zt44L6mA8rfDfj+PHnxFc/FeK6mQ==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright": "1.62.1"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/@rolldown/binding-android-arm-eabi": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm-eabi/-/binding-android-arm-eabi-1.2.13.tgz",
      "integrity": "sha512-Vu/NICrgdRvUOeaJZIyB2FP63s6fO/4ud5l8dXmxDx9yDyn+mN0y+gsvsVviSli+T361Aqo0h46EuMoobrwawA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-android-arm64": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.2.13.tgz",
      "integrity": "sha512-6LEoIrGy5vvCd2boNnv2soPSUZj/PRvhp8R/t9KlX+mIZxThIE/ZqxrGXxmuNX0FuvQFvLdZr7S4HrYpYBVhEQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-arm64": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.2.13.tgz",
      "integrity": "sha512-CaJSRzlQ6Q+zkDMVA9OkVxBjVoPRCDEE3v0FSJ9kIQBgRjFApA3Si4ijhbNVUji7ZJt+PfO0e46qy4nPInHUPA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-x64": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.2.13.tgz",
      "integrity": "sha512-e4r340I5hxSzJkD3YJBxgzq/rJ3wwxwdLLb2FPt1Zpyem20nrQPT11DDEEkazwxaHumH8wpglsp/Ozgj/wT6mw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-freebsd-x64": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.2.13.tgz",
      "integrity": "sha512-hoBWDZ4/K/mJKVMbsgUd1jfpA2DiOrJ54mpegObU9TBHBBrtX4FLIXJJQRDPZ/2Dn91GvPob+Z2hwKJzf4E5SQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm-gnueabihf": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.2.13.tgz",
      "integrity": "sha512-oF9fZu3vTWnTiVAkDFxU9PJLt1nh20K9RRpuHsR7ZnE2L7XookBbDBVLojCVSLGbvtSlxeUNnjAj6DbNsKyzbg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-gnu": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.2.13.tgz",
      "integrity": "sha512-DTpb/+jMiqWMPgphn4ksW1zW+XLJ6dJJ9FMvnIk9I291LhCctMPhMYJrP5t9p6C9qa3KXadDdUEZHBaPh3kNxQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-musl": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.2.13.tgz",
      "integrity": "sha512-xU+Kvv9N2A3SY35zFh1FWWNjxbadE/BKeqnkXe7vScU4GZsw757BlVmDLITZEq8DPpk6m7uoDYkK7P+x/uU5Ow==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-ppc64-gnu": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.2.13.tgz",
      "integrity": "sha512-XMk/hnhh25oQ756Lclb1Q11h4ll0xC0Esa5w4Vzp+mAE2S3AGJgeM0SonrIgY8fHhjarb6hcoTuwoFG0VVP2ig==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-s390x-gnu": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.2.13.tgz",
      "integrity": "sha512-U1BoTHYmlywE2n3HUWjzZ+8EQsKr+OwpxYuDWaubx42tUL8QSL7nOqRz/NVHanibbFP3M1Rxuprz/wNcbMKjqw==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-gnu": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.13.tgz",
      "integrity": "sha512-J4cm80Pc6wEwV5AZ42o62sIQgDk+Y7R2s646jIwuvO+4V46QB58N4vVuMPWCBaNgursXLpmUWJV//WQAkPvHBQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-musl": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.13.tgz",
      "integrity": "sha512-W0euZS40U4V6JkmEnVCIX9mcsL6cbXQ4X8c2w+MMOIjFg68TXUW+u3RT+2e1t1pv9mg/EP3pDtK3POXdQ7Rxyw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-openharmony-arm64": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.2.13.tgz",
      "integrity": "sha512-do/AF/4n9MRshia3a5aXoy8xM2c6mgfT6D7H/dY6my5z+hfCIR4ab7mk4IRj++nsEQpKy39kd0DQnDq+r692tw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-arm64-msvc": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.2.13.tgz",
      "integrity": "sha512-6FtUf2cJZobutJdxnGYX8z0vtbgqU0b2v8vfBhkXb9wp2MppMFtkunE+IaOntyi01rkIQoPW2GHABtfzsC0BRQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-x64-msvc": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.2.13.tgz",
      "integrity": "sha512-UKhFaZTeTcbKrb3iU82m17jVcPEAoqDkCN5MBqgPyZSwp/cQmib21crTS0DdH7T1B7wZRWEI89YQAOJMet5yhg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.1.tgz",
      "integrity": "sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/react": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.3.0.tgz",
      "integrity": "sha512-N0rFCuH9YoxG9/m61l9MfpJKfmLOVU0em7ipIz6TRgSSkvReLB9vL85GB+yr8Bs5leqpvg96JSwF4ZS1s4viQg==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.3.0.tgz",
      "integrity": "sha512-ZI7bU42mZXXKHn/qNLEw2IrbiINU7X5+vfgdixBHkCNpYWXjKgfQ/P+uyGb5CjOLB9UcnTeg3rylQtV2hym44Q==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^19.3.0"
      }
    },
    "node_modules/@typescript/typescript-aix-ppc64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-aix-ppc64/-/typescript-aix-ppc64-7.0.2.tgz",
      "integrity": "sha512-MTKKkWB7p/0E9xi1d1tHtZ5PiLkGEMIq88pK2CubZjOsLtYTLqhgIgi6zepFa+9GHZ6h05NMCkQxGKiPXMxXtQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-darwin-arm64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-darwin-arm64/-/typescript-darwin-arm64-7.0.2.tgz",
      "integrity": "sha512-gowzar9MwS/aRWp6f3a4KUqzRjAZjOsmGNCM6LcTgXum+dBfgsBVMN+AgvOCCbguXyick6LJhpBszxMebJ8syA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-darwin-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-darwin-x64/-/typescript-darwin-x64-7.0.2.tgz",
      "integrity": "sha512-SZ9xZInqApNlNGc9s0W1VSsktYSOe9cFqNOIqmN1Gs8SmkjKZYFt017G4VwPxASInODuAdbTW7sXiFUf893RgA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-freebsd-arm64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-freebsd-arm64/-/typescript-freebsd-arm64-7.0.2.tgz",
      "integrity": "sha512-W5NH4y/J0plIIS5b2xvTEkU7JFxyqdMAOgf+Ilhl0vHQXKO5dZoxd+C/jEtq56c4F3wk71RB4BMRQ2XdI+bwYQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-freebsd-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-freebsd-x64/-/typescript-freebsd-x64-7.0.2.tgz",
      "integrity": "sha512-UMGDx5sTpzNw3WiPebH7l90IWfJggEd+egHt/q6p7/Cm3zqoV7VxkGXt+3DxPIw8CcmvAB0j3sVVfbhX+M4Tpw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-arm": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-arm/-/typescript-linux-arm-7.0.2.tgz",
      "integrity": "sha512-gffT3xPz9sR7j/YJExkyPntrI0P2EP9XbOyWzth2/Gs0RstK+90RBcO0ncXoXy/beYll1SXw846Nf2zdnEz0QQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-arm64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-arm64/-/typescript-linux-arm64-7.0.2.tgz",
      "integrity": "sha512-Qh4eU4/y3yDjnfjjyPYihMj5/ODIlmt+Bzu17OI+fiSRDW57QmU5SiN63exPRNJPKUzcc1INa1NXdrJ+MqHjUQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-loong64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-loong64/-/typescript-linux-loong64-7.0.2.tgz",
      "integrity": "sha512-uEHck9i8hoAzXPiYRib1O7miOnz23SxIeVl6F4LXox+qov1K35jHcEW6VHKvZI+pyvl7fZEP4MCU5LYvIq1GuQ==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-mips64el": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-mips64el/-/typescript-linux-mips64el-7.0.2.tgz",
      "integrity": "sha512-R4KvAMnE43W5Qeqb0Ly56O3mWMWIAgsMyz36DCaycd5nbg/9kzm0liw3JocfRqyJY0KPmzFjbswozXyW0DnIYA==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-ppc64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-ppc64/-/typescript-linux-ppc64-7.0.2.tgz",
      "integrity": "sha512-DORx5b3sd/4S7eayxm4FQv+A7CrkUIGRaHiwI8oiHTAI1fAPWhF4J0vAlkC8biAlHSVVwxMQ3tjZ2/DVbnQiiA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-riscv64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-riscv64/-/typescript-linux-riscv64-7.0.2.tgz",
      "integrity": "sha512-wf0jqEDOjrPRnKwYRyyJDRo11KMbvMFrU+q4zqKyChODBzvlkbhNQfKvLxQCcwTpdDaXSHZTVuh0JoCrKCUMHQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-s390x": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-s390x/-/typescript-linux-s390x-7.0.2.tgz",
      "integrity": "sha512-IkwJc3L7yhytWd/ewjyxNDfOmswCm9GWMJT/ue/dU4aZNbwZeYAetq42VyLmsmSjvoX7z74X6ZaYCtzAr0EuGw==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-x64/-/typescript-linux-x64-7.0.2.tgz",
      "integrity": "sha512-EYdf2cNg7rgCWJnxCdJ+F3V39O8ihb37eHAu1LK8oAFizgTQbPOK7zHHXbPt8rX24COqODXeI3sIf0fCXG7H/A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-netbsd-arm64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-netbsd-arm64/-/typescript-netbsd-arm64-7.0.2.tgz",
      "integrity": "sha512-+polYF4MF04aPpO5FTkHran9yUQDSXqy5GiSDKpsll5jy3l3+g9QLhpf39T+ePtefhXLOGrLl0QIjkQP6VnelA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-netbsd-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-netbsd-x64/-/typescript-netbsd-x64-7.0.2.tgz",
      "integrity": "sha512-8YIT0EHM/3dq10ZOVF/A7pc/YSMtbcecct4rWtexrnSCHOPcpC2KTLXfTCR6vDpnSiY12heNb1GiN/wu+T/FyA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-openbsd-arm64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-openbsd-arm64/-/typescript-openbsd-arm64-7.0.2.tgz",
      "integrity": "sha512-APT8+ClYnuYm1u9+kgGXoMj2VzWzcymwh2gNSQVySHfkRDGOTVkoWLjCmOQSaO+PoqQ57B0flRp9SA+7GnnkzQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-openbsd-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-openbsd-x64/-/typescript-openbsd-x64-7.0.2.tgz",
      "integrity": "sha512-yX7s+Q0Dln0Dt9tEzZsAjXXR/+ytBM7AlglaqyeMPxQszJ1JhlJdZ6jLA+IzldHtflX81em7lDao1xXu+aRRkg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-sunos-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-sunos-x64/-/typescript-sunos-x64-7.0.2.tgz",
      "integrity": "sha512-dLJDGaLZ1D4HPQn62u1n8mBDkJREwMsAkCdkwd4Ieqw+x3TUyTsqY0YiBCtE6H6OzzgGk3iuZ3vFWRS+E8/d1g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-win32-arm64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-win32-arm64/-/typescript-win32-arm64-7.0.2.tgz",
      "integrity": "sha512-Gyl1Vy6OsWesLzmq+EP0Fb7b4Nid5232AvcA2SFcdYreldpNtYFFofPjnt62y9hQy7VTaZp65ICJjuAQRaVcIQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-win32-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-win32-x64/-/typescript-win32-x64-7.0.2.tgz",
      "integrity": "sha512-0BQ3HkAHHlKLSp1qRvf3SUhGpGsDuhB/jgFw75guyqbxJqEaS0Cw/VFO8i2nHglJUzQCRtMMR/IBAKE3ETMC4g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "6.1.2",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-6.1.2.tgz",
      "integrity": "sha512-fhJNGUdscQa4HkI0xFxwonWyhnVReCPDbXI7FH7jmzpnVCrFQI7PRrhWecO263610vOrs9tr2Y4xcf8uAdFxbw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rolldown/pluginutils": "^1.0.1"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "peerDependencies": {
        "@rolldown/plugin-babel": "^0.1.7 || ^0.2.0",
        "babel-plugin-react-compiler": "^1.0.0",
        "oxc-transform-react": "^0.152.0",
        "vite": "^8.0.0"
      },
      "peerDependenciesMeta": {
        "@rolldown/plugin-babel": {
          "optional": true
        },
        "babel-plugin-react-compiler": {
          "optional": true
        },
        "oxc-transform-react": {
          "optional": true
        }
      }
    },
    "node_modules/cookie": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-1.1.1.tgz",
      "integrity": "sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/lightningcss": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",
      "integrity": "sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.33.0",
        "lightningcss-darwin-arm64": "1.33.0",
        "lightningcss-darwin-x64": "1.33.0",
        "lightningcss-freebsd-x64": "1.33.0",
        "lightningcss-linux-arm-gnueabihf": "1.33.0",
        "lightningcss-linux-arm64-gnu": "1.33.0",
        "lightningcss-linux-arm64-musl": "1.33.0",
        "lightningcss-linux-x64-gnu": "1.33.0",
        "lightningcss-linux-x64-musl": "1.33.0",
        "lightningcss-win32-arm64-msvc": "1.33.0",
        "lightningcss-win32-x64-msvc": "1.33.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.33.0.tgz",
      "integrity": "sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.33.0.tgz",
      "integrity": "sha512-Sciaz8eenNTKn9b3t7+xr0ipTp9YxKQY4npwQ3mrRuL0BAVHBLyZxofhaKBAVtzmtRZ/zTyo0/to4B1uWG/Djg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.33.0.tgz",
      "integrity": "sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.33.0.tgz",
      "integrity": "sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.33.0.tgz",
      "integrity": "sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.33.0.tgz",
      "integrity": "sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.33.0.tgz",
      "integrity": "sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz",
      "integrity": "sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz",
      "integrity": "sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.33.0.tgz",
      "integrity": "sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.33.0.tgz",
      "integrity": "sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lucide-react": {
      "version": "1.56.0",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-1.56.0.tgz",
      "integrity": "sha512-b+hqj30/trHBma5r1zlKb6yLewQp6tUtnz9loc3xdrYerPmvLYhlEbyPVCJ8DOg2/blBf6lwPLznftFVACka6A==",
      "license": "ISC",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.20",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.20.tgz",
      "integrity": "sha512-uKdg2G3GNCKQn9byYOpxbGqrT2fGO5KRt5J/8b3pok8rT6qxGWF6hxMyJiEYtAf+FVyYuD9hRaDqX5uPFYJ4ZQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/playwright": {
      "version": "1.62.1",
      "resolved": "https://registry.npmjs.org/playwright/-/playwright-1.62.1.tgz",
      "integrity": "sha512-0M+L3LAD8/nm554LOla9Ayx0j0tmFZ0FBcoQ7F1VuVHpM/XpiC8RcDzBQB8W5+hA8L22THxELzeF+2WcUzvcLg==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright-core": "1.62.1"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=20"
      },
      "optionalDependencies": {
        "fsevents": "2.3.2"
      }
    },
    "node_modules/playwright-core": {
      "version": "1.62.1",
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.62.1.tgz",
      "integrity": "sha512-wPYSwEBJY9GHraISXqyqtx0na0LpO3XEX7jNDhntbex7tzUS7kLnZsOlFruFJB4Hi/rhDMjXGqHewDZ68nYZVw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "playwright-core": "cli.js"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/playwright/node_modules/fsevents": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.2.tgz",
      "integrity": "sha512-xiqMQR4xAeHTuB9uWm+fFRcIOgKBMiOBP+eXiyT7jsgVCq1bkVygt00oASowB7EdtpOHaaPgKt812P9ab+DDKA==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.30",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.30.tgz",
      "integrity": "sha512-zkd+e9S1AQHhmaBKye9zlFHWjOwVgqXl1q3ECYy8561K7qxR2cREf/STLskulBFd78k6AOFeA+ff1TtEzk9bAA==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.20",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.2"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/react": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/react/-/react-19.3.0.tgz",
      "integrity": "sha512-E8LUcbtBWt20bbl2YoHfx4ZDBdxVTfOKtCZn9cDSJ4l6/nuoApcpIBcj47t2wZoVX8g2ZHuMHbiShgCR1T5Sog==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.3.0.tgz",
      "integrity": "sha512-JDk8dgif51OjFoDE70+OT9ICyYr+69HlmihNwp1+Nsfbna3t5sIiCa9ZJktDmQ4/1b/rn26hIAR2uYXDMr5r0Q==",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.28.0"
      },
      "peerDependencies": {
        "react": "^19.3.0"
      }
    },
    "node_modules/react-router": {
      "version": "7.18.4",
      "resolved": "https://registry.npmjs.org/react-router/-/react-router-7.18.4.tgz",
      "integrity": "sha512-PUPQcMhMGRAslLcvtlPz/kmzBEWPhLdgLFrL7pLNepBL6dX0lWj4WD2cUYVgYCuT3jxvghYFg81cDTj44DhetQ==",
      "license": "MIT",
      "dependencies": {
        "cookie": "^1.0.1",
        "set-cookie-parser": "^2.6.0"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      },
      "peerDependenciesMeta": {
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/react-router-dom": {
      "version": "7.18.4",
      "resolved": "https://registry.npmjs.org/react-router-dom/-/react-router-dom-7.18.4.tgz",
      "integrity": "sha512-yrfmJHIpDG7taCpqKjT1G5B6q3O2K+RN8/fgNf0lTjCwiPbQ0ei6vXX9ZjQR+7ld8Tr7Z5xmyMnZ8YJrphWQUw==",
      "license": "MIT",
      "dependencies": {
        "react-router": "7.18.4"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      }
    },
    "node_modules/rolldown": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/rolldown/-/rolldown-1.2.13.tgz",
      "integrity": "sha512-/5apOkwWxtACcQtZ5WlrAsKS4JwXVThQPJZ3RqIruRY9UG9M8e0VlXN068xum/JRKA4aIUoJ13ghe/kGCvidiQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@oxc-project/types": "=0.153.0",
        "@rolldown/pluginutils": "^1.0.0"
      },
      "bin": {
        "rolldown": "bin/cli.mjs"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "optionalDependencies": {
        "@rolldown/binding-android-arm-eabi": "1.2.13",
        "@rolldown/binding-android-arm64": "1.2.13",
        "@rolldown/binding-darwin-arm64": "1.2.13",
        "@rolldown/binding-darwin-x64": "1.2.13",
        "@rolldown/binding-freebsd-x64": "1.2.13",
        "@rolldown/binding-linux-arm-gnueabihf": "1.2.13",
        "@rolldown/binding-linux-arm64-gnu": "1.2.13",
        "@rolldown/binding-linux-arm64-musl": "1.2.13",
        "@rolldown/binding-linux-ppc64-gnu": "1.2.13",
        "@rolldown/binding-linux-s390x-gnu": "1.2.13",
        "@rolldown/binding-linux-x64-gnu": "1.2.13",
        "@rolldown/binding-linux-x64-musl": "1.2.13",
        "@rolldown/binding-openharmony-arm64": "1.2.13",
        "@rolldown/binding-win32-arm64-msvc": "1.2.13",
        "@rolldown/binding-win32-x64-msvc": "1.2.13"
      }
    },
    "node_modules/scheduler": {
      "version": "0.28.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.28.0.tgz",
      "integrity": "sha512-juorfCmIkIw8tT+p5BXSm6PJjQF/ycEYmKyzURCIt/RaZIhL+PulbQ9Yu2z1HdOJDdqDTlxA1+xKBmHXJsczAw==",
      "license": "MIT"
    },
    "node_modules/set-cookie-parser": {
      "version": "2.7.2",
      "resolved": "https://registry.npmjs.org/set-cookie-parser/-/set-cookie-parser-2.7.2.tgz",
      "integrity": "sha512-oeM1lpU/UvhTxw+g3cIfxXHyJRc/uidd3yK1P242gzHds0udQBYzs3y8j4gCCW+ZJ7ad0yctld8RYO+bdurlvw==",
      "license": "MIT"
    },
    "node_modules/source-map-js": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.2.tgz",
      "integrity": "sha512-KGj/8Y43x35aZVDtt+J4mK1hoLGHULMYfSkODJNQjNDC3oW1PqPoxMwo0pLUsWM/UEGzON/NxeHywEfNXNP3Vw==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/typescript": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-7.0.2.tgz",
      "integrity": "sha512-8FYau96o3NKOhbjKi/qNvG/W5jhzxkbdm5sj9AbZ/5T5sWqn3hJgLfGx27sRKZWTvyzCP8dLRBTf5tBTSRVUNA==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc"
      },
      "engines": {
        "node": ">=16.20.0"
      },
      "optionalDependencies": {
        "@typescript/typescript-aix-ppc64": "7.0.2",
        "@typescript/typescript-darwin-arm64": "7.0.2",
        "@typescript/typescript-darwin-x64": "7.0.2",
        "@typescript/typescript-freebsd-arm64": "7.0.2",
        "@typescript/typescript-freebsd-x64": "7.0.2",
        "@typescript/typescript-linux-arm": "7.0.2",
        "@typescript/typescript-linux-arm64": "7.0.2",
        "@typescript/typescript-linux-loong64": "7.0.2",
        "@typescript/typescript-linux-mips64el": "7.0.2",
        "@typescript/typescript-linux-ppc64": "7.0.2",
        "@typescript/typescript-linux-riscv64": "7.0.2",
        "@typescript/typescript-linux-s390x": "7.0.2",
        "@typescript/typescript-linux-x64": "7.0.2",
        "@typescript/typescript-netbsd-arm64": "7.0.2",
        "@typescript/typescript-netbsd-x64": "7.0.2",
        "@typescript/typescript-openbsd-arm64": "7.0.2",
        "@typescript/typescript-openbsd-x64": "7.0.2",
        "@typescript/typescript-sunos-x64": "7.0.2",
        "@typescript/typescript-win32-arm64": "7.0.2",
        "@typescript/typescript-win32-x64": "7.0.2"
      }
    },
    "node_modules/vite": {
      "version": "8.3.4",
      "resolved": "https://registry.npmjs.org/vite/-/vite-8.3.4.tgz",
      "integrity": "sha512-IftLE8phJhdNRIGNEV4JCCvfNScoZQVfcXaN8TQropWGJtOHcu+iAB9pHcuGvmEb/kddw0LBe/jS8ztdC6xdiQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "lightningcss": "^1.33.0",
        "picomatch": "^4.0.7",
        "postcss": "^8.5.29",
        "rolldown": "~1.2.12",
        "tinyglobby": "^0.2.17"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "@vitejs/devtools": "^0.7.1",
        "esbuild": "^0.27.0 || ^0.28.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "@vitejs/devtools": {
          "optional": true
        },
        "esbuild": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    }
  }
}
````

## package.json

````json
{
  "name": "rock-macos-notes-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "typecheck": "tsc --noEmit",
    "test": "playwright test"
  },
  "dependencies": {
    "lucide-react": "1.56.0",
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "react-router-dom": "7.18.4"
  },
  "devDependencies": {
    "@playwright/test": "1.62.1",
    "@types/react": "19.3.0",
    "@types/react-dom": "19.3.0",
    "@vitejs/plugin-react": "6.1.2",
    "typescript": "7.0.2",
    "vite": "8.3.4"
  }
}
````

## playwright.config.ts

````typescript
import { defineConfig } from '@playwright/test';

// 每项测试使用独立临时SQLite和真实FastAPI；不复用个人服务或数据库。
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1,
  use: { baseURL: 'http://127.0.0.1:15173', browserName: 'chromium', channel: 'chrome', viewport: { width: 1440, height: 1000 } },
  webServer: {
    command: 'npm run dev -- --port 15173', url: 'http://127.0.0.1:15173', reuseExistingServer: false,
    env: { ROCK_API_TARGET: 'http://127.0.0.1:18000' },
  },
  reporter: 'list'
});
````

## src/App.tsx

````tsx
import { Route, Routes } from 'react-router-dom';
import { DesktopLayout } from './components/DesktopLayout';
import { EditorPage } from './pages/EditorPage';
import { NotesHome } from './pages/NotesHome';
import { SearchPage, TagsPage, SettingsPage, NotFoundPage } from './pages/UtilityPages';

export function App() {
  return <Routes><Route element={<DesktopLayout />}>
    <Route index element={<NotesHome />} />
    <Route path="notes" element={<NotesHome />} />
    <Route path="notes/:noteId" element={<EditorPage />} />
    <Route path="search" element={<SearchPage />} />
    <Route path="tags" element={<TagsPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes>;
}
````

## src/api/index.ts

````typescript
import { preferences } from '../mocks/data';
import type { Note, TreeNode, Backlink, GraphData, NoteQuery, Preferences } from '../types';

// 笔记只通过真实 HTTP 读写；失败会抛错，不退回示例数据。
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  } catch {
    throw new Error('无法连接笔记服务，请确认后端已启动。');
  }
  // 204 没有响应体，不能调用 response.json()。
  if (response.status === 204) return undefined as T;
  let body: unknown;
  try { body = await response.json(); }
  catch { throw new Error('笔记服务返回了无法读取的响应。'); }
  if (!response.ok) {
    const detail = body && typeof body === 'object' && 'detail' in body ? body.detail : null;
    const message = typeof detail === 'string' ? detail : Array.isArray(detail)
      ? detail.map(item => typeof item?.msg === 'string' ? item.msg : '输入格式有误').join('；') : '';
    throw new Error(message || `笔记请求失败（${response.status}）`);
  }
  return body as T;
}

/** 当前由真实笔记的 notebook 字段分组；不调用尚未实现的 /api/notebooks。 */
export function notesToTree(notes: Note[]): TreeNode[] {
  const groups = new Map<string, TreeNode[]>();
  groups.set('收件箱', []);
  for (const note of notes) {
    if (!groups.has(note.notebook)) groups.set(note.notebook, []);
    groups.get(note.notebook)!.push({ id: 'tree-' + note.id, name: note.title, kind: 'note', noteId: note.id });
  }
  return [...groups].map(([name, children]) => ({ id: 'notebook-' + name, name, kind: 'notebook', children }));
}

/** 从 GET /api/notes 的真实结果构造 TreeNode[]；尚无独立目录管理。 */
export async function getNotebooks(): Promise<TreeNode[]> { return notesToTree(await listNotes()); }

/** GET /api/notes；查询忽略空白，各字符按顺序匹配标题或正文，可隔字；tag仍需匹配。 */
export async function listNotes({ query = '', tag = '' }: NoteQuery = {}): Promise<Note[]> {
  const notes = await request<Note[]>('/api/notes');
  const characters = [...query.replace(/\s+/gu, '').toLocaleLowerCase()];
  function matchesInOrder(text: string): boolean {
    if (characters.length === 0) return true;
    let next = 0;
    for (const character of text.toLocaleLowerCase()) {
      if (character === characters[next]) next++;
      if (next === characters.length) return true;
    }
    return false;
  }
  return notes.filter(note => (matchesInOrder(note.content) || matchesInOrder(note.title)) && (!tag || note.tags.includes(tag)));
}

/** GET /api/notes/:id；不存在时将后端404显示给页面。 */
export async function getNote(id: string): Promise<Note> {
  return request<Note>('/api/notes/' + encodeURIComponent(id));
}

/** PATCH /api/notes/:id；提交标题与正文，以服务器返回值作为已保存状态。 */
export async function updateNote(id: string, patch: Pick<Note, 'title' | 'content'>): Promise<Note> {
  return request<Note>('/api/notes/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(patch) });
}

/** POST /api/notes；只提交标题，由后端生成ID、时间与其余默认字段。 */
export async function createNote(input: { title: string }): Promise<Note> {
  return request<Note>('/api/notes', { method: 'POST', body: JSON.stringify(input) });
}

/** DELETE /api/notes/:id；成功204无响应体，失败保留后端错误。 */
export async function deleteNote(id: string): Promise<void> {
  await request<void>('/api/notes/' + encodeURIComponent(id), { method: 'DELETE' });
}

/** 反链接口待接入；空列表仅为占位，页面明确说明，不能作为无反链的分析结论。 */
export async function getBacklinks(_id: string): Promise<Backlink[]> { return []; }

/** 暂时只显示从真实接口读取的中心笔记，不生成模拟关联。 */
export async function getGraph(id: string): Promise<GraphData> {
  const note = await getNote(id);
  return { nodes: [{ id: note.id, title: note.title }], edges: [] };
}

/** 从 GET /api/notes 的真实 tags 聚合；尚未实现独立标签API或标签编辑。 */
export async function getTags(): Promise<{ name: string; count: number }[]> {
  const notes = await listNotes();
  const names = [...new Set(notes.flatMap(note => note.tags))];
  return names.map(name => ({ name, count: notes.filter(note => note.tags.includes(name)).length }));
}

// 偏好仅保留在当前页面会话；云同步继续明确标为模拟。
let preferenceStore = structuredClone(preferences);
export async function getPreferences(): Promise<Preferences> { return structuredClone(preferenceStore); }
export async function updatePreferences(input: Preferences): Promise<Preferences> {
  preferenceStore = { ...input, fontSize: Math.min(22, Math.max(14, input.fontSize)) };
  return structuredClone(preferenceStore);
}
export async function syncNotes(): Promise<{ mode: 'mock'; syncedAt: string }> {
  return { mode: 'mock', syncedAt: new Date().toISOString() };
}
````

## src/components/BacklinksPanel.tsx

````tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Link2, Network, ChevronDown } from 'lucide-react';
import { getBacklinks, getGraph } from '../api';
import type { Backlink, GraphData } from '../types';
import styles from '../styles/Desktop.module.css';

function RelationshipGraph({ graph, current }: { graph: GraphData; current: string }) {
  const navigate = useNavigate();
  const neighbors = graph.nodes.filter(node => node.id !== current).slice(0, 4);
  const points = [{ x: 63, y: 50 }, { x: 187, y: 54 }, { x: 73, y: 148 }, { x: 181, y: 146 }];
  return <svg viewBox="0 0 250 190" className={styles.graph} role="group" aria-label="当前笔记的局部关系图">
    {neighbors.map((node, index) => <line key={'edge-' + node.id} x1="125" y1="98" x2={points[index].x} y2={points[index].y} stroke="#ced9e7" strokeWidth="1.2" />)}
    <circle cx="125" cy="98" r="27" fill="#e8f2ff" /><circle cx="125" cy="98" r="8" fill="#0071e3" /><text x="125" y="134" textAnchor="middle" className={styles.graphLabel}>当前笔记</text>
    {neighbors.map((node, index) => <g key={node.id} role="button" tabIndex={0} aria-label={'打开' + node.title} onClick={() => navigate(`/notes/${node.id}`)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(`/notes/${node.id}`); } }}>
      <title>{node.title}</title><circle cx={points[index].x} cy={points[index].y} r="6" fill="#8eb5de" /><text x={points[index].x} y={points[index].y - 13} textAnchor="middle" className={styles.graphLabel}>{node.title.slice(0, 6)}</text>
    </g>)}
  </svg>;
}
export function BacklinksPanel({ noteId }: { noteId?: string }) {
  const [links, setLinks] = useState<Backlink[]>([]);
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setLinks([]); setGraph(null); setError('');
    if (!noteId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([getBacklinks(noteId), getGraph(noteId)]).then(([nextLinks, nextGraph]) => { if (!cancelled) { setLinks(nextLinks); setGraph(nextGraph); } })
      .catch((cause: unknown) => { if (!cancelled) setError(cause instanceof Error ? cause.message : '关系加载失败'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    // 快速切换文档时，迟到的旧响应不能覆盖新文档反链。
    return () => { cancelled = true; };
  }, [noteId]);
  return <>
    <div className={styles.backlinkHeader}><span>文档关联</span><Link2 size={16} /></div>
    {!noteId ? <p className={styles.panelHint}>打开一篇笔记，查看它与其他想法的联系。</p> : loading ? <p className={styles.panelHint}>正在寻找连接…</p> : error ? <p className={styles.panelHint} role="alert">{error}</p> : <>
      <button className={styles.backlinkSection} onClick={() => setCollapsed(!collapsed)} aria-expanded={!collapsed}><span><ChevronDown size={14} style={{ transform: collapsed ? 'rotate(-90deg)' : undefined }} />反向链接</span><b>{links.length}</b></button>
      <div hidden={collapsed}>{links.map(link => <Link className={styles.backlinkCard} key={link.noteId} to={`/notes/${link.noteId}`}><div><strong>{link.title}</strong><ArrowUpRight size={14} /></div><p>{link.excerpt}</p><small>{link.notebook}</small></Link>)}{!links.length && <p className={styles.panelHint}>反链分析尚未接入，当前仅显示笔记本身。</p>}</div>
      <div className={styles.graphHeading}><Network size={14} /><span>局部关系图</span><small>待接入</small></div>
      {graph && <RelationshipGraph graph={graph} current={noteId} />}
      <p className={styles.graphHint}>点击节点，继续探索一个想法。</p>
      <div className={styles.connectionNote}><Link2 size={17} /><p>每一次连接，<br />都是一次新的理解。</p></div>
    </>}
  </>;
}
````

## src/components/DesktopLayout.tsx

````tsx
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Files, Search, Tags, Settings, PanelLeft, PanelRight, RefreshCw, Plus, ChevronDown, Check, Layers } from 'lucide-react';
import { syncNotes } from '../api';
import { useNotes } from '../state/NotesContext';
import { FileTree } from './FileTree';
import { BacklinksPanel } from './BacklinksPanel';
import { IconButton } from './IconButton';
import styles from '../styles/Desktop.module.css';

const modules = [{ to: '/notes', label: '文档', icon: Files }, { to: '/search', label: '搜索', icon: Search }, { to: '/tags', label: '标签', icon: Tags }];
export function DesktopLayout() {
  const store = useNotes();
  const location = useLocation();
  const navigate = useNavigate();
  const [left, setLeft] = useState(() => window.innerWidth >= 760);
  const [right, setRight] = useState(() => window.innerWidth >= 1180);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [lastNote, setLastNote] = useState('');
  const match = location.pathname.match(/^\/notes\/([^/]+)$/);
  const noteId = match?.[1];
  useEffect(() => { if (noteId) setLastNote(noteId); }, [noteId]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); navigate('/search'); }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [navigate]);
  async function sync() {
    setBusy(true);
    try { await syncNotes(); setToast('模拟同步完成 · 尚未连接云端'); }
    catch (error) { setToast(error instanceof Error ? error.message : '同步失败'); }
    finally { setBusy(false); }
  }
  async function create() {
    setCreating(true);
    try { const note = await store.create(); navigate(`/notes/${note.id}`); setToast('已在收件箱创建笔记'); }
    catch (error) { setToast(error instanceof Error ? error.message : '创建失败'); }
    finally { setCreating(false); }
  }
  return <div className={styles.desktop}><div className={styles.window}>
    {/* 组件：共用半透明工具栏，始终跨越四栏。窗口圆点是装饰，不伪装关闭功能。 */}
    <header className={styles.toolbar}>
      <div className={styles.toolbarLeft}><div className={styles.trafficLights} aria-hidden="true"><i /><i /><i /></div><span className={styles.appName}>岩笺<span>Notes</span></span><IconButton icon={PanelLeft} label={left ? '隐藏文件树' : '显示文件树'} aria-pressed={left} onClick={() => setLeft(!left)} /></div>
      <button className={styles.quickSearch} onClick={() => navigate('/search')}><Search size={15} /><span>搜索你的笔记</span><kbd>⌘ K</kbd></button>
      <div className={styles.toolbarRight}><span className={styles.mockBadge}>本机笔记</span><IconButton icon={RefreshCw} label="模拟同步" disabled={busy} className={`${styles.iconButton} ${busy ? styles.spinning : ''}`} onClick={sync} /><IconButton icon={PanelRight} label={right ? '隐藏反链面板' : '显示反链面板'} aria-pressed={right} onClick={() => setRight(!right)} /><IconButton icon={Settings} label="打开设置" onClick={() => navigate('/settings')} /></div>
    </header>
    {/* 组件：四栏布局。侧栏隐藏后不占宽度，中间区域 flex:1 自动扩展。 */}
    <div className={styles.body}>
      <nav className={styles.rail} aria-label="功能模块"><div className={styles.railLogo}><Layers size={22} strokeWidth={1.5} /></div>
        {modules.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to === '/notes' ? lastNote && store.notes.some(note => note.id === lastNote) ? `/notes/${lastNote}` : '/notes' : to} title={label} aria-label={label} className={() => `${styles.railButton} ${location.pathname.startsWith(to) ? styles.railSelected : ''}`} aria-current={location.pathname.startsWith(to) ? 'page' : undefined}><Icon size={20} strokeWidth={1.6} /></NavLink>)}
        <div className={styles.railBottom}><NavLink to="/settings" aria-label="设置" title="设置" className={({ isActive }) => `${styles.railButton} ${isActive ? styles.railSelected : ''}`}><Settings size={20} strokeWidth={1.6} /></NavLink><Link className={styles.avatar} to="/settings" title="工作区设置">R</Link></div>
      </nav>
      <aside className={`${styles.sidebar} ${left ? '' : styles.panelHidden}`} aria-label="文件树面板" aria-hidden={!left} inert={!left}>
        <div className={styles.workspaceName}><span className={styles.workspaceIcon}>R</span><div><strong>Rock 的知识空间</strong><small>给想法一个安静的地方</small></div><ChevronDown size={13} aria-hidden="true" /></div>
        <div className={styles.sidebarHeading}><span>笔记本</span><IconButton icon={Plus} label="新建笔记" disabled={creating || store.loading || !!store.error} onClick={create} /></div>
        {store.loading ? <p className={styles.panelHint}>正在读取笔记本…</p> : store.error ? <div className={styles.panelHint}><p role="alert">{store.error}</p><button onClick={() => { void store.refresh().catch(() => {}); }}>重新连接</button></div> : <FileTree nodes={store.tree} />}
        <div className={styles.sidebarFooter}><span><Check size={13} />{store.notes.length} 篇笔记</span><small>保存到本机数据库</small></div>
      </aside>
      <main className={styles.main} id="main-content"><Outlet /></main>
      <aside className={`${styles.backlinks} ${right ? '' : styles.panelHidden}`} aria-label="反链面板" aria-hidden={!right} inert={!right}><BacklinksPanel noteId={noteId} /></aside>
    </div>
    {toast && <div className={styles.toast} role="status">{toast}</div>}
  </div></div>;
}
````

## src/components/FileTree.tsx

````tsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import type { TreeNode } from '../types';
import styles from '../styles/Desktop.module.css';

// 递归的关键：分组节点再次渲染 TreeItem；文档节点是递归的终点。
function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  if (node.kind === 'note') return <li>
    <NavLink to={`/notes/${node.noteId}`} title={node.name} className={({ isActive }) => `${styles.treeRow} ${isActive ? styles.treeSelected : ''}`} style={{ paddingLeft: 12 + depth * 14 }}>
      <FileText size={15} strokeWidth={1.5} /><span>{node.name}</span>
    </NavLink>
  </li>;
  const Icon = node.kind === 'notebook' ? BookOpen : Folder;
  return <li>
    <button className={`${styles.treeRow} ${depth === 0 ? styles.treeRoot : ''}`} style={{ paddingLeft: 8 + depth * 14 }} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
      {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}<Icon size={15} strokeWidth={1.5} /><span>{node.name}</span>
    </button>
    {/* 保留子组件而使用 hidden，父文件夹折叠时不会重置子文件夹的状态。 */}
    <ul className={styles.treeList} hidden={!expanded}>{node.children.map(child => <TreeItem key={child.id} node={child} depth={depth + 1} />)}</ul>
  </li>;
}
export function FileTree({ nodes }: { nodes: TreeNode[] }) {
  return <nav aria-label="笔记本与文档"><ul className={styles.treeList}>{nodes.map(node => <TreeItem key={node.id} node={node} />)}</ul></nav>;
}
````

## src/components/IconButton.tsx

````tsx
import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import styles from '../styles/Desktop.module.css';

// 统一图标尺寸和可访问名称；不把只有图标的按钮留给用户猜。
export function IconButton({ icon: Icon, label, active = false, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string; active?: boolean }) {
  return <button type="button" className={`${styles.iconButton} ${active ? styles.iconActive : ''}`} title={label} aria-label={label} {...props}><Icon size={18} strokeWidth={1.6} /></button>;
}
````

## src/components/MarkdownPreview.tsx

````tsx
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Desktop.module.css';

// 最小安全预览：文本由 React 转义，不使用 dangerouslySetInnerHTML。
// 支持标题、引用、列表、段落、[[id|名称]]；不声称实现完整 Markdown 规范。
function inline(text: string): ReactNode[] {
  return text.split(/(\[\[[^\]]+\]\])/g).map((part, index) => {
    const match = part.match(/^\[\[([\w-]+)(?:\|([^\]]+))?\]\]$/);
    return match ? <Link key={index} to={`/notes/${match[1]}`} className={styles.wikiLink}>{match[2] ?? match[1]}</Link> : <Fragment key={index}>{part}</Fragment>;
  });
}
export function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: ReactNode[] = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line.trim()) continue;
    if (line.startsWith('# ')) { blocks.push(<h2 key={index} className={styles.bodyTitle}>{inline(line.slice(2))}</h2>); continue; }
    if (line.startsWith('## ')) { blocks.push(<h2 key={index}>{inline(line.slice(3))}</h2>); continue; }
    if (line.startsWith('### ')) { blocks.push(<h3 key={index}>{inline(line.slice(4))}</h3>); continue; }
    if (line.startsWith('> ')) { blocks.push(<blockquote key={index}>{inline(line.slice(2))}</blockquote>); continue; }
    if (line.startsWith('- ')) {
      const items: ReactNode[] = []; const start = index;
      while (index < lines.length && lines[index].startsWith('- ')) { items.push(<li key={index}>{inline(lines[index].slice(2))}</li>); index++; }
      index--; blocks.push(<ul key={start}>{items}</ul>); continue;
    }
    blocks.push(<p key={index}>{inline(line)}</p>);
  }
  return <div className={styles.prose}>{blocks}</div>;
}
````

## src/main.tsx

````tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { NotesProvider } from './state/NotesContext';
import { App } from './App';
import './styles/global.css';

// BrowserRouter 使用浏览器历史，Link/导航不会整页刷新。
createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><NotesProvider><App /></NotesProvider></BrowserRouter></StrictMode>
);
````

## src/mocks/data.ts

````typescript
import type { Note, TreeNode, Preferences } from '../types';

// 全部内容为虚构示例，mock 数据集中存放，组件不直接导入这里。
export const notes: Note[] = [
  { id: 'welcome', title: '把知识连接起来', notebook: '个人知识库', tags: ['知识管理', '入门'], updatedAt: '2026-10-14T09:30:00+08:00', content: '# 把知识连接起来\n\n好的笔记，不只是记录。它让一个想法遇见另一个想法，让零散的知识慢慢长成自己的体系。\n\n> 不急着收集更多，先让已经拥有的知识产生连接。\n\n## 一个安静的思考空间\n\n把注意力留给文字。左边是你的知识地图，右边是想法之间的联系，中间是正在发生的思考。\n\n- 用笔记本整理不同主题\n- 用双向链接发现新的关联\n- 用标签，让想法跨越文件夹\n\n## 从一个小小的习惯开始\n\n每天写下一件值得记住的事。它可以是读书时的一句话，也可以是一个尚未找到答案的问题。\n\n试试阅读 [[atomic|原子笔记的方法]]，或者打开 [[weekly|本周学习回顾]]，为今天的想法找到一个位置。\n\n## 留给未来的自己\n\n笔记不是终点，而是一段对话的开始。下一次遇到相似的问题，你已经有了一条可以继续走下去的路。' },
  { id: 'atomic', title: '原子笔记的方法', notebook: '个人知识库', tags: ['知识管理', '方法'], updatedAt: '2026-10-13T15:20:00+08:00', content: '# 原子笔记的方法\n\n一条笔记围绕一个想法。让它足够独立，也足够容易连接。\n\n## 写给自己，而不是摘抄\n\n用自己的话解释概念，再给出一个例子。试着回答：它解决了什么问题？\n\n- 一个清晰的标题\n- 一个具体的核心观点\n- 一条通向其他笔记的链接\n\n这也是 [[welcome|把知识连接起来]] 的第一步。' },
  { id: 'weekly', title: '本周学习回顾', notebook: '学习与成长', tags: ['复盘', '学习'], updatedAt: '2026-10-14T08:10:00+08:00', content: '# 本周学习回顾\n\n## 本周的收获\n\n我开始将项目拆成更小的、可以验证的步骤。每次完成一个闭环，比一次写很多代码更有帮助。\n\n- 理解输入校验与数据库操作的边界\n- 整理了 [[python|Python 学习笔记]]\n- 尝试用 [[atomic|原子笔记的方法]] 记录新概念\n\n## 下一步\n\n亲手完成一个查询函数，说明为什么需要关闭连接。回到 [[welcome|把知识连接起来]]，把这些实践连成线。' },
  { id: 'python', title: 'Python 学习笔记', notebook: '学习与成长', tags: ['Python', '学习'], updatedAt: '2026-10-12T11:00:00+08:00', content: '# Python 学习笔记\n\n函数让一段操作有名字，也让相同的逻辑能够重复使用。\n\n## 输入、处理、返回\n\n明确函数接收什么，以及调用者会得到什么。列表与字典是整理资料记录的好工具。\n\n> 运行成功是证据，读懂代码是基础，两者都值得记录。\n\n把实践整理在 [[weekly|本周学习回顾]] 里。' },
  { id: 'reading', title: '阅读是一场慢旅行', notebook: '个人知识库', tags: ['阅读', '想法'], updatedAt: '2026-10-11T19:00:00+08:00', content: '# 阅读是一场慢旅行\n\n读书时，留一点空白给自己的问题。\n\n## 不只是划线\n\n把触动你的段落转化成自己的语言，再和已有的经验连接。\n\n这让我想起 [[welcome|把知识连接起来]]：真正重要的是，你从中看到了什么。' },
  { id: 'inbox', title: '随手记 · 灵感收件箱', notebook: '收件箱', tags: ['灵感'], updatedAt: '2026-10-10T10:00:00+08:00', content: '# 随手记 · 灵感收件箱\n\n暂时不分类也没关系。先把想法留住，再找时间慢慢整理。\n\n- 一个想读的主题\n- 一句突然想到的话\n- 一个需要亲手验证的问题' }
];

export const notebooks: TreeNode[] = [
  { id: 'personal', name: '个人知识库', kind: 'notebook', children: [
    { id: 'start', name: '开始于此', kind: 'folder', children: [
      { id: 'tree-welcome', name: '把知识连接起来', kind: 'note', noteId: 'welcome' },
      { id: 'tree-atomic', name: '原子笔记的方法', kind: 'note', noteId: 'atomic' }
    ] },
    { id: 'ideas', name: '阅读与思考', kind: 'folder', children: [{ id: 'tree-reading', name: '阅读是一场慢旅行', kind: 'note', noteId: 'reading' }] }
  ] },
  { id: 'study', name: '学习与成长', kind: 'notebook', children: [
    { id: 'tree-weekly', name: '本周学习回顾', kind: 'note', noteId: 'weekly' },
    { id: 'code', name: '编程笔记', kind: 'folder', children: [{ id: 'tree-python', name: 'Python 学习笔记', kind: 'note', noteId: 'python' }] }
  ] },
  { id: 'inbox-folder', name: '收件箱', kind: 'notebook', children: [{ id: 'tree-inbox', name: '随手记 · 灵感收件箱', kind: 'note', noteId: 'inbox' }] }
];

// 这是独立的 mock 关系数据；正式服务可根据文档链接计算反链。
export const incomingLinks: Record<string, { source: string; excerpt: string }[]> = {
  welcome: [
    { source: 'atomic', excerpt: '让一个独立的想法，与已有知识建立新的连接。' },
    { source: 'weekly', excerpt: '把一周的小小实践连成线，留下真实的学习痕迹。' },
    { source: 'reading', excerpt: '真正重要的是，你从阅读中看到了什么。' }
  ],
  atomic: [{ source: 'welcome', excerpt: '试试原子笔记的方法，为今天的想法找到一个位置。' }, { source: 'weekly', excerpt: '用一条笔记记录一个新概念。' }],
  weekly: [{ source: 'welcome', excerpt: '打开本周学习回顾。' }, { source: 'python', excerpt: '把实践整理在本周学习回顾里。' }],
  python: [{ source: 'weekly', excerpt: '本周整理了 Python 学习笔记。' }]
};
export const preferences: Preferences = { fontSize: 16, showLineNumbers: false };
````

## src/pages/EditorPage.tsx

````tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight, Pencil, Eye, Save, FileText, Trash2 } from 'lucide-react';
import { getNote } from '../api';
import type { Note } from '../types';
import { useNotes } from '../state/NotesContext';
import { MarkdownPreview } from '../components/MarkdownPreview';
import styles from '../styles/Desktop.module.css';

// key 让每篇文档拥有独立加载状态；草稿在父 Context 中，切换后仍保留。
export function EditorPage() { const { noteId = '' } = useParams(); return <Editor key={noteId} id={noteId} />; }
function Editor({ id }: { id: string }) {
  const store = useNotes();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let cancelled = false;
    getNote(id).then(value => { if (!cancelled) setNote(value); })
      .catch((cause: unknown) => { if (!cancelled) setError(cause instanceof Error ? cause.message : '文档加载失败'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);
  const draft = note ? store.drafts[id] ?? { title: note.title, content: note.content } : null;
  const dirty = !!(draft && note && (draft.title !== note.title || draft.content !== note.content));
  async function save() {
    if (!draft || !note || saving || deleting || !dirty) return;
    setSaving(true); setMessage('');
    try { const saved = await store.save(id, draft); setNote(saved); setMessage('已保存到本机数据库'); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : '保存失败，草稿仍保留'); }
    finally { setSaving(false); }
  }
  async function remove() {
    if (!note || !draft || saving || deleting) return;
    const warning = dirty ? '\n未保存的草稿也会一并删除。' : '';
    if (!window.confirm(`永久删除“${draft.title || note.title}”？${warning}\n此操作无法撤销。`)) return;
    setDeleting(true); setMessage('');
    try { await store.remove(id); navigate('/notes', { replace: true }); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : '删除失败，笔记和草稿仍保留'); }
    finally { setDeleting(false); }
  }
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void save(); }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  });
  useEffect(() => { document.title = (draft?.title || '笔记') + ' · 岩笺'; }, [draft?.title]);
  if (loading) return <div className={styles.pageState} role="status">正在打开笔记…</div>;
  if (error || !note || !draft) return <div className={styles.pageState} role="alert"><h1>无法打开笔记</h1><p>{error}</p><Link to="/notes">返回开始页</Link></div>;
  return <>
    <div className={styles.documentBar}><span><BookOpen size={14} />{note.notebook}<ChevronRight size={12} /><span>{draft.title}</span></span><span className={styles.documentStatus}><i />{dirty ? '有未保存草稿' : '已保存'}<span className={styles.modeBadge}>本机</span></span></div>
    <div className={styles.editorScroll}>
      <article className={styles.document} style={{ fontSize: store.preferences.fontSize }}>
        <div className={styles.documentKicker}><FileText size={13} /><span>一页笔记 · 一个想法</span><div className={styles.editorActions}><button onClick={() => setEditing(!editing)} disabled={saving || deleting} aria-pressed={editing}>{editing ? <Eye size={14} /> : <Pencil size={14} />}{editing ? '预览' : '编辑'}</button><button onClick={() => void save()} disabled={!dirty || saving || deleting}><Save size={14} />{saving ? '保存中' : '保存'}</button><button onClick={() => void remove()} disabled={saving || deleting}><Trash2 size={14} />{deleting ? '删除中' : '删除笔记'}</button></div></div>
        {/* 标题单独编辑；正文保留 Markdown 一级标题，但预览中弱化重复标题。 */}
        {editing ? <input aria-label="笔记标题" className={styles.titleInput} value={draft.title} disabled={saving || deleting} onChange={event => store.patchDraft(note, { title: event.target.value })} /> : <h1>{draft.title}</h1>}
        <div className={styles.noteMeta}><span>更新于 {new Date(note.updatedAt).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai' })}</span><span className={styles.metaDot}>·</span><span>{draft.content.replace(/\s/g, '').length} 字符</span>{note.tags.map(tag => <Link key={tag} className={styles.tag} to={'/tags?tag=' + encodeURIComponent(tag)}>#{tag}</Link>)}</div>
        {message && <p className={styles.saveMessage} role="status">{message}</p>}
        {editing ? <div className={styles.sourceEditor}>{store.preferences.showLineNumbers && <pre className={styles.lineNumbers} aria-hidden="true">{draft.content.split('\n').map((_, index) => index + 1).join('\n')}</pre>}<textarea aria-label="笔记正文" spellCheck={false} value={draft.content} disabled={saving || deleting} onChange={event => store.patchDraft(note, { content: event.target.value })} /></div> : <MarkdownPreview content={draft.content} />}
        <div className={styles.documentEnd}><span />留一点空白，给下一个想法<span /></div>
      </article>
    </div>
  </>;
}
````

## src/pages/NotesHome.tsx

````tsx
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useNotes } from '../state/NotesContext';
import styles from '../styles/Desktop.module.css';

export function NotesHome() {
  const store = useNotes();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function create() {
    setBusy(true); setError('');
    try { const note = await store.create(); navigate('/notes/' + note.id); }
    catch (cause) { setError(cause instanceof Error ? cause.message : '创建失败'); }
    finally { setBusy(false); }
  }
  if (store.loading) return <div className={styles.pageState} role="status">正在读取本机笔记…</div>;
  if (store.error) return <section className={styles.utilityPage}><h1>无法读取笔记</h1><p role="alert">{store.error}</p><button onClick={() => { void store.refresh().catch(() => {}); }}>重新连接</button></section>;
  if (store.notes.length) return <Navigate to={'/notes/' + store.notes[0].id} replace />;
  return <section className={styles.utilityPage}><p className={styles.eyebrow}>YOUR FIRST NOTE</p><h1>从第一篇笔记开始</h1><p className={styles.subtitle}>写下一个想法，保存后会留在本机数据库里。</p><div className={styles.editorActions}><button disabled={busy} onClick={() => void create()}>{busy ? '正在创建…' : '创建第一篇笔记'}</button></div>{error && <p role="alert">{error}</p>}</section>;
}
````

## src/pages/UtilityPages.tsx

````tsx
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Hash, ArrowUpRight, SlidersHorizontal, Monitor } from 'lucide-react';
import { listNotes, getTags } from '../api';
import type { Note } from '../types';
import { useNotes } from '../state/NotesContext';
import styles from '../styles/Desktop.module.css';

function Results({ notes }: { notes: Note[] }) {
  return <div className={styles.results}>{notes.map(note => <Link key={note.id} to={`/notes/${note.id}`} className={styles.resultCard}><div><h2>{note.title}</h2><ArrowUpRight size={16} /></div><p>{note.content.replace(/[#>\[\]]/g, '').slice(0, 110)}</p><small>{note.notebook} · {note.tags.join(' / ')}</small></Link>)}</div>;
}
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  // 拼音组合期间先同步本地输入，选词结束后再更新URL，避免路由打断输入法。
  const [input, setInput] = useState(query);
  const composing = useRef(false);
  useEffect(() => { if (!composing.current) setInput(query); }, [query]);
  function publish(value: string) {
    setParams(value ? { q: value } : {}, { replace: true });
  }
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false; setLoading(true); setError('');
    listNotes({ query }).then(value => { if (!cancelled) setNotes(value); }).catch((cause: unknown) => { if (!cancelled) setError(cause instanceof Error ? cause.message : '搜索失败'); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [query]);
  return <section className={styles.utilityPage}><p className={styles.eyebrow}>FIND AN IDEA</p><h1>搜索你的知识</h1><p className={styles.subtitle}>按输入顺序查找，忽略空格，中间可以隔着其他字。</p><label className={styles.searchInput}><Search size={19} /><input autoFocus aria-label="搜索笔记" placeholder="搜索标题或正文…" value={input} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={event => {
    composing.current = false;
    const value = event.currentTarget.value;
    setInput(value); publish(value);
  }} onChange={event => {
    const value = event.target.value;
    setInput(value);
    if (!composing.current) publish(value);
  }} /></label><p className={styles.resultCount} role="status">{loading ? '正在搜索…' : error || `找到 ${notes.length} 篇笔记`}</p>{!loading && !error && <><Results notes={notes} />{!notes.length && <p className={styles.emptyText}>没有匹配的笔记，换一个关键词试试。</p>}</>}</section>;
}
export function TagsPage() {
  const [params, setParams] = useSearchParams();
  const tag = params.get('tag') ?? '';
  const [tags, setTags] = useState<{ name: string; count: number }[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false; setLoading(true); setError('');
    Promise.all([getTags(), listNotes({ tag })]).then(([nextTags, nextNotes]) => { if (!cancelled) { setTags(nextTags); setNotes(nextNotes); } }).catch((cause: unknown) => { if (!cancelled) setError(cause instanceof Error ? cause.message : '标签加载失败'); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tag]);
  return <section className={styles.utilityPage}><p className={styles.eyebrow}>ACROSS NOTEBOOKS</p><h1>让想法相遇</h1><p className={styles.subtitle}>标签让相似的主题，跨越文件夹的边界。</p><div className={styles.tagCloud}><button className={!tag ? styles.tagChosen : ''} onClick={() => setParams({})}>全部</button>{tags.map(item => <button className={tag === item.name ? styles.tagChosen : ''} key={item.name} onClick={() => setParams({ tag: item.name })}><Hash size={13} />{item.name}<span>{item.count}</span></button>)}</div><p className={styles.resultCount} role="status">{loading ? '正在读取…' : error || `${notes.length} 篇相关笔记`}</p>{!loading && !error && <><Results notes={notes} />{!notes.length && <p className={styles.emptyText}>还没有这个标签的笔记。</p>}</>}</section>;
}
export function SettingsPage() {
  const { preferences, setPreferences } = useNotes();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function change(next: typeof preferences) {
    setBusy(true);
    try { await setPreferences(next); setStatus('偏好已应用 · 仅当前会话'); }
    catch (cause) { setStatus(cause instanceof Error ? cause.message : '设置保存失败'); }
    finally { setBusy(false); }
  }
  return <section className={styles.utilityPage}><p className={styles.eyebrow}>MAKE IT YOURS</p><h1>你的书写空间</h1><p className={styles.subtitle}>少一点干扰，多一点专注。</p><div className={styles.settingsCard}><h2><SlidersHorizontal size={18} />编辑器</h2><label>正文字号<select aria-label="正文字号" disabled={busy} value={preferences.fontSize} onChange={event => void change({ ...preferences, fontSize: Number(event.target.value) })}>{[14, 16, 18, 20, 22].map(size => <option key={size} value={size}>{size} px</option>)}</select></label><label>源码编辑时显示行号<input type="checkbox" checked={preferences.showLineNumbers} disabled={busy} onChange={event => void change({ ...preferences, showLineNumbers: event.target.checked })} /></label></div><div className={styles.settingsCard}><h2><Monitor size={18} />关于工作区</h2><p>岩笺 · 本机笔记</p><p>笔记已连接本机服务和数据库。目录按笔记本分组，搜索和标签筛选在前端完成；反链分析待接入，云同步仍为模拟，偏好仅在当前会话生效。</p></div><p role="status" className={styles.saveMessage}>{status}</p></section>;
}
export function NotFoundPage() { return <section className={styles.utilityPage}><h1>没有找到这个页面</h1><p>这个地址没有对应的功能。</p><Link to="/notes">返回笔记</Link></section>; }
````

## src/state/NotesContext.tsx

````tsx
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '../api';
import type { Note, TreeNode, Preferences } from '../types';

type Draft = Pick<Note, 'title' | 'content'>;
interface Store {
  tree: TreeNode[]; notes: Note[]; loading: boolean; error: string;
  drafts: Record<string, Draft>; preferences: Preferences;
  patchDraft: (note: Note, patch: Partial<Draft>) => void;
  save: (id: string, draft: Draft) => Promise<Note>;
  create: () => Promise<Note>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  setPreferences: (value: Preferences) => Promise<void>;
}
const Context = createContext<Store | null>(null);
const latestFirst = (a: Note, b: Note) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id);

// 父级状态保留各文档草稿；笔记和文件树都来自同一份服务器数据。
export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const tree = useMemo(() => api.notesToTree(notes), [notes]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [preferences, setPreferenceState] = useState<Preferences>({ fontSize: 16, showLineNumbers: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function refresh() {
    setLoading(true); setError('');
    try { setNotes(await api.listNotes()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : '笔记加载失败'); throw cause; }
    finally { setLoading(false); }
  }
  useEffect(() => {
    let cancelled = false;
    Promise.all([api.listNotes(), api.getPreferences()]).then(([nextNotes, prefs]) => {
      if (!cancelled) { setNotes(nextNotes); setPreferenceState(prefs); }
    }).catch((cause: unknown) => { if (!cancelled) setError(cause instanceof Error ? cause.message : '笔记加载失败'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  function patchDraft(note: Note, patch: Partial<Draft>) {
    setDrafts(previous => ({ ...previous, [note.id]: { ...(previous[note.id] ?? { title: note.title, content: note.content }), ...patch } }));
  }
  async function save(id: string, draft: Draft) {
    const saved = await api.updateNote(id, draft);
    setNotes(previous => previous.map(note => note.id === id ? saved : note).sort(latestFirst));
    // 仅清理已提交的版本，失败或等待响应时的新输入仍保留。
    setDrafts(previous => {
      if (previous[id]?.title !== draft.title || previous[id]?.content !== draft.content) return previous;
      const next = { ...previous }; delete next[id]; return next;
    });
    return saved;
  }
  async function create() {
    const note = await api.createNote({ title: '未命名笔记' });
    setNotes(previous => [...previous, note].sort(latestFirst));
    return note;
  }
  async function remove(id: string) {
    await api.deleteNote(id);
    // 服务器确认删除后再移除笔记和草稿；失败时保留用户输入。
    setNotes(previous => previous.filter(note => note.id !== id));
    setDrafts(previous => { const next = { ...previous }; delete next[id]; return next; });
  }
  async function setPreferences(value: Preferences) {
    const previous = preferences;
    setPreferenceState(value);
    try { setPreferenceState(await api.updatePreferences(value)); }
    catch (cause) { setPreferenceState(previous); throw cause; }
  }
  return <Context.Provider value={{ tree, notes, drafts, preferences, loading, error, patchDraft, save, create, remove, refresh, setPreferences }}>{children}</Context.Provider>;
}
export function useNotes() {
  const store = useContext(Context);
  if (!store) throw new Error('useNotes 必须在 NotesProvider 内使用');
  return store;
}
````

## src/styles/Desktop.module.css

````css
/* 组件：桌面与窗口。柔和背景让毛玻璃边界可见，窗口不使用硬阴影。 */
.desktop { min-height:100dvh; padding:26px; background:radial-gradient(ellipse at 0 0,#e9edf5,transparent 60%),radial-gradient(ellipse at 100% 100%,#e6eaf2,transparent 65%),#f5f5f7; }
.window { height:calc(100dvh - 52px); min-height:580px; max-width:1700px; margin:auto; border:1px solid #ffffffc7; border-radius:10px; box-shadow:0 18px 65px #26324713,0 2px 8px #26324708; overflow:hidden; display:flex; flex-direction:column; position:relative; background:#fff; }
/* 组件：半透明顶部工具栏，横跨所有列，不跟随文档滚动。 */
.toolbar { height:58px; flex-shrink:0; display:flex; justify-content:space-between; align-items:center; gap:20px; padding:0 18px; border-bottom:1px solid #e2e4e880; background:#ffffffb8; backdrop-filter:blur(20px); }
.toolbarLeft,.toolbarRight { display:flex; align-items:center; gap:12px; }
.toolbarLeft { min-width:240px; }
.toolbarRight { min-width:240px; justify-content:flex-end; gap:6px; }
.trafficLights { display:flex; gap:8px; margin-right:10px; }
.trafficLights i { width:11px; height:11px; border-radius:50%; background:#ff6057; border:1px solid #00000009; }
.trafficLights i:nth-child(2) { background:#febc2e; }.trafficLights i:nth-child(3) { background:#28c840; }
.appName { font-size:14px; font-weight:650; letter-spacing:.06em; display:flex; align-items:baseline; gap:7px; }
.appName span { font-weight:400; color:#86868b; font-size:11px; letter-spacing:0; }
.quickSearch { width:320px; max-width:32%; border:1px solid #e0e2e7; border-radius:6px; background:#f4f5f7b5; padding:7px 10px; display:flex; align-items:center; gap:9px; color:#86868b; font-size:12px; }
.quickSearch:hover { background:#eceff4; }.quickSearch kbd { font:10px inherit; margin-left:auto; color:#a0a3a9; }
.iconButton { display:inline-grid; place-items:center; width:30px; height:30px; border:0; border-radius:6px; background:transparent; color:#777e87; flex-shrink:0; }
.iconButton:hover { background:#e7ebf1; color:#333b46; }.iconActive { background:#e6eef9; color:#0071e3; }
.mockBadge { font-size:9px; letter-spacing:.03em; color:#86868b; padding-right:9px; }
.spinning svg { animation:spin 1s linear infinite; }@keyframes spin { to { transform:rotate(360deg); } }
/* 组件：四栏骨架。min-width:0 让正文正确收缩；隐藏侧栏后编辑区自动获得剩余空间。 */
.body { display:flex; flex:1; min-height:0; }.main { flex:1; min-width:0; display:flex; flex-direction:column; background:#fff; overflow:auto; }
.rail { width:56px; flex-shrink:0; border-right:1px solid #e0e4ea90; display:flex; align-items:center; flex-direction:column; padding:20px 0 15px; gap:12px; background:#edf0f6ae; backdrop-filter:blur(20px); }
.railLogo { color:#5981b8; margin:0 0 19px; }.railButton { width:36px; height:36px; border-radius:7px; display:grid; place-items:center; color:#868e99; }
.railButton:hover { background:#e0e6ef; }.railSelected { color:#0071e3; background:#dceafb; box-shadow:inset 0 0 0 1px #0071e307; }
.railBottom { margin-top:auto; display:flex; flex-direction:column; align-items:center; gap:18px; }.avatar { width:27px; height:27px; display:grid; place-items:center; font-size:11px; font-weight:600; border:1px solid #d2d9e4; border-radius:50%; background:#e6ebf3; color:#677a94; }
/* 组件：文件树面板，宽度约 220px，底部显示 mock 范围。 */
.sidebar { width:220px; flex-shrink:0; display:flex; flex-direction:column; background:#f4f5f8c7; backdrop-filter:blur(20px); border-right:1px solid #e6e7eb; overflow:auto; }
.panelHidden { display:none; }.workspaceName { display:flex; align-items:center; gap:8px; padding:25px 15px 24px; }.workspaceIcon { height:29px; width:29px; background:linear-gradient(145deg,#e1ebf8,#f0f3f8); border:1px solid #d3deed; border-radius:7px; display:grid; place-items:center; font-size:13px; color:#5c7eaa; }
.workspaceName strong { display:block; font-size:11px; font-weight:600; }.workspaceName small { display:block; font-size:9px; color:#9a9ca3; margin-top:4px; }.workspaceName>svg { margin-left:auto; color:#a1a6af; }
.sidebarHeading { display:flex; align-items:center; justify-content:space-between; padding:0 13px 8px 17px; font-size:10px; color:#9699a1; letter-spacing:.05em; }.sidebarHeading .iconButton { height:25px; width:25px; }
.treeList { list-style:none; padding:0; margin:0; }.treeRow { width:calc(100% - 14px); margin:2px 7px; min-height:32px; border:0; background:transparent; display:flex; align-items:center; gap:7px; border-radius:5px; padding-right:9px; text-align:left; font-size:11px; color:#626773; }
.treeRow span { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }.treeRow svg { flex-shrink:0; color:#9199a5; }.treeRow:hover { background:#e8ebf1; }.treeRoot { margin-top:12px; font-weight:550; color:#4d5360; }.treeSelected { background:#d0e3f7!important; color:#27517f; }.treeSelected svg { color:#5981ac; }
.sidebarFooter { margin-top:auto; padding:25px 17px 18px; font-size:10px; color:#969ba3; }.sidebarFooter span { display:flex; align-items:center; gap:6px; }.sidebarFooter small { display:block; padding-top:5px; font-size:9px; }.panelHint { color:#86868b; font-size:12px; line-height:1.8; padding:0 18px; }
/* 组件：文档顶部路径；编辑内容最大 700px，外层独立滚动。 */
.documentBar { min-height:46px; padding:0 25px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f0f0f2; font-size:10px; color:#92969d; gap:15px; }
.documentBar>span { display:flex; align-items:center; gap:8px; min-width:0; }.documentBar>span>span:not(.modeBadge) { max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }.documentStatus { flex-shrink:0; }.documentStatus i { width:5px; height:5px; background:#92b0a0; border-radius:50%; }.modeBadge { font-size:8px; background:#f1f3f6; color:#9099a5; padding:2px 4px; border-radius:3px; }
.editorScroll { overflow:auto; flex:1; }.document { width:min(100%,780px); padding:49px 40px 45px; margin:0 auto; line-height:1.75; }
.documentKicker { display:flex; align-items:center; gap:7px; color:#969ca7; font-size:10px; letter-spacing:.03em; margin-bottom:19px; }.editorActions { display:flex; gap:4px; margin-left:auto; }.editorActions button { display:flex; align-items:center; gap:5px; font-size:10px; background:transparent; color:#7b8592; border:0; border-radius:5px; padding:5px 7px; }.editorActions button:hover { background:#f0f4fa; color:#0071e3; }
.document h1,.titleInput { font-size:clamp(25px,2.3vw,34px); color:#24292f; line-height:1.45; letter-spacing:-.035em; font-weight:650; margin:0 0 14px; }.titleInput { width:100%; border:0; border-bottom:1px solid #cbdcee; background:transparent; }
.noteMeta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:10px; color:#a0a3a9; margin-bottom:33px; }.metaDot { color:#c4c6cc; }.tag { color:#7895b3; background:#f0f5fa; border-radius:4px; padding:2px 6px; font-size:9px; }.tag:hover { background:#dceafa; }
.prose { color:#555b65; font-size:1em; line-height:1.85; }.prose p { margin:0 0 20px; }.prose h2 { margin:32px 0 14px; font-size:1.18em; color:#353b44; font-weight:600; }.prose h3 { font-size:1.08em; }.prose .bodyTitle { display:none; }.prose blockquote { margin:25px 0 31px; padding:15px 19px; border-left:3px solid #9ab9df; background:#f5f8fc; color:#768598; font-size:.9em; border-radius:0 5px 5px 0; }.prose ul { padding-left:22px; margin:12px 0 25px; }.prose li { padding:3px 0; }.prose li::marker { color:#a1b4cc; }.wikiLink { color:#467caf; background:#edf4fb; border-radius:3px; padding:1px 3px; }.wikiLink:hover { background:#dceaf9; }
.sourceEditor { display:flex; gap:12px; }.sourceEditor textarea { width:100%; min-height:450px; resize:vertical; border:1px solid #e1e7ef; border-radius:6px; background:#fbfcfe; padding:18px; line-height:1.75; color:#4c596b; font:inherit; }.lineNumbers { color:#a0a8b3; font:inherit; line-height:1.75; margin:18px 0; text-align:right; white-space:pre; }
.saveMessage { color:#52799d; background:#eef5fc; border-radius:5px; padding:8px 12px; font-size:11px; }.saveMessage:empty { display:none; }.documentEnd { margin:52px 0 0; display:flex; align-items:center; gap:15px; justify-content:center; color:#b7bcc4; font-size:9px; }.documentEnd span { width:26px; height:1px; background:#e5e8ed; }
/* 组件：280px 毛玻璃反链面板与局部图。反链、图节点都走客户端路由。 */
.backlinks { width:280px; flex-shrink:0; background:#f8f9fbba; backdrop-filter:blur(20px); border-left:1px solid #e8eaee; overflow:auto; padding-bottom:20px; }.backlinks.panelHidden { display:none; }
.backlinkHeader { min-height:46px; display:flex; align-items:center; justify-content:space-between; padding:0 18px; border-bottom:1px solid #eaecef; color:#767e8a; font-size:11px; }.backlinkHeader svg { color:#9ca7b6; }
.backlinkSection { display:flex; justify-content:space-between; align-items:center; width:100%; background:transparent; border:0; padding:23px 18px 14px; font-size:11px; color:#646f7e; }.backlinkSection span { display:flex; gap:6px; align-items:center; }.backlinkSection b { font-size:9px; font-weight:400; color:#8a96a6; background:#e9edf2; padding:1px 6px; border-radius:4px; }
.backlinkCard { display:block; margin:0 13px 10px; background:#ffffffb5; border:1px solid #e9edf2; border-radius:6px; padding:13px 12px; }.backlinkCard:hover { background:#f0f6fd; border-color:#cbdeef; }.backlinkCard>div { display:flex; align-items:center; justify-content:space-between; gap:7px; }.backlinkCard strong { font-size:11px; font-weight:550; color:#5b697b; }.backlinkCard svg { color:#b0bac8; }.backlinkCard p { font-size:10px; line-height:1.8; color:#959da8; margin:8px 0; }.backlinkCard small { color:#b3b9c2; font-size:9px; }
.graphHeading { display:flex; align-items:center; gap:7px; padding:26px 18px 0; font-size:10px; color:#8b95a3; }.graphHeading small { margin-left:auto; font-size:8px; color:#afb8c6; }.graph { width:100%; padding:0 10px; }.graphLabel { fill:#8f9eb2; font-family:inherit; font-size:8px; }.graph g { cursor:pointer; }.graph g:hover circle { fill:#0071e3; }.graph g:focus-visible { outline:none; }.graph g:focus-visible circle { stroke:#0071e3; stroke-width:3px; }.graphHint { text-align:center; color:#b0b7c2; font-size:9px; margin:0; }.connectionNote { margin:33px 22px 0; padding-top:24px; border-top:1px solid #e5eaf1; color:#c0cad8; }.connectionNote p { font-size:11px; line-height:1.9; margin-top:10px; color:#adb6c4; }
/* 组件：搜索、标签与设置子页面，复用最大内容宽度和四栏窗口。 */
.utilityPage { width:min(100%,780px); padding:50px 40px; margin:0 auto; }.utilityPage h1 { font-size:30px; margin:10px 0; letter-spacing:-.03em; }.eyebrow { color:#8ea0b6; font-size:9px; letter-spacing:.15em; }.subtitle { color:#969ca6; font-size:12px; margin-bottom:30px; line-height:1.8; }.searchInput { display:flex; align-items:center; gap:12px; padding:12px 14px; border:1px solid #d5e1ef; background:#f8fbff; border-radius:7px; color:#91aac5; }.searchInput input { width:100%; border:0; background:transparent; outline:0; color:#4c5d73; font-size:13px; }.resultCount { font-size:11px; color:#9aa5b3; margin:22px 0; }.results { display:flex; flex-direction:column; gap:12px; }.resultCard { border:1px solid #e7ecf2; border-radius:7px; padding:18px; }.resultCard:hover { background:#f8fbff; border-color:#cbdff4; }.resultCard>div { display:flex; align-items:center; justify-content:space-between; color:#91a7bf; }.resultCard h2 { margin:0; font-size:14px; font-weight:550; color:#4b5e73; }.resultCard p { color:#949da9; font-size:11px; line-height:1.8; }.resultCard small { color:#a9b1bd; font-size:9px; }
.tagCloud { display:flex; flex-wrap:wrap; gap:8px; }.tagCloud button { display:flex; gap:5px; align-items:center; border:1px solid #e2e8f0; border-radius:5px; background:#f8fafd; color:#8997a9; padding:7px 10px; font-size:11px; }.tagCloud button:hover,.tagChosen { background:#e6f0fd!important; border-color:#bfd6f1!important; color:#467aaf!important; }.tagCloud span { color:#a7b8cb; font-size:9px; margin-left:4px; }
.settingsCard { border:1px solid #e5eaf1; border-radius:8px; padding:22px; margin-bottom:20px; }.settingsCard h2 { display:flex; align-items:center; gap:10px; font-size:14px; margin:0 0 20px; color:#657d98; }.settingsCard label { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:13px 0; border-top:1px solid #edf0f4; font-size:12px; color:#858f9d; }.settingsCard select { border:1px solid #d7e0eb; border-radius:4px; background:#f6f9fd; color:#6a7e97; padding:5px 8px; }.settingsCard p { font-size:12px; color:#969fab; line-height:1.8; }.settingsCard input { accent-color:#0071e3; }.emptyText { color:#98a4b3; font-size:13px; padding:30px 0; }.pageState { padding:60px 40px; color:#909bac; font-size:13px; }.pageState h1 { color:#526b88; font-size:22px; }.pageState a { color:#0071e3; }.toast { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); padding:10px 17px; border:1px solid #d9e3ee; background:#fffffff0; backdrop-filter:blur(20px); border-radius:7px; box-shadow:0 5px 20px #23395210; color:#73869d; font-size:11px; z-index:10; max-width:90%; }
/* 小屏仍可手动显示侧栏，但改为浮层；中间区域不会被挤到不可操作。 */
@media(max-width:1179px) { .mockBadge { display:none; }.toolbarLeft,.toolbarRight { min-width:0; }.toolbar { gap:10px; } }
@media(max-width:900px) { .backlinks { position:absolute; top:58px; right:0; bottom:0; z-index:5; background:#f8f9fbf5; box-shadow:-8px 0 30px #21334b10; }.documentStatus { display:none!important; } }
@media(max-width:759px) { .desktop { padding:10px; }.window { height:calc(100dvh - 20px); min-height:500px; }.sidebar { position:absolute; left:56px; top:58px; bottom:0; z-index:5; background:#f4f5f8f5; box-shadow:8px 0 30px #21334b10; }.toolbar { padding:0 11px; }.trafficLights { gap:5px; margin-right:0; }.trafficLights i { width:8px; height:8px; }.appName span { display:none; }.toolbarLeft { gap:8px; }.quickSearch { width:30px; max-width:none; padding:6px; border:0; background:transparent; }.quickSearch span,.quickSearch kbd { display:none; }.toolbarRight { gap:1px; }.document,.utilityPage { padding:30px 22px; }.documentBar { padding:0 20px; }.document h1 { font-size:25px; }.noteMeta { gap:6px; }.documentKicker { flex-wrap:wrap; }.editorActions { margin-left:0; }.backlinks { width:min(280px,calc(100% - 56px)); } }
@media(prefers-reduced-motion:reduce) { .spinning svg { animation:none; } }
````

## src/styles/global.css

````css
/* 系统字体遵循 macOS 风格需求；不下载字体或其他远程视觉资源。 */
:root { font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC",sans-serif; color:#1d1d1f; background:#f5f5f7; font-synthesis:none; text-rendering:optimizeLegibility; -webkit-font-smoothing:antialiased; }
* { box-sizing:border-box; }
body { margin:0; }
button,input,textarea,select { font:inherit; }
button,a { -webkit-tap-highlight-color:transparent; }
button { cursor:pointer; }
button:disabled { cursor:default; opacity:.45; }
a { color:inherit; text-decoration:none; }
button { color:inherit; }
:focus-visible { outline:2px solid #0071e3; outline-offset:3px; }
[hidden] { display:none!important; }
::selection { background:#d0e3f7; }
::-webkit-scrollbar { width:6px; height:6px; }
::-webkit-scrollbar-thumb { background:#cbd0d7; border-radius:8px; }
````

## src/types.ts

````typescript
// 前后端共享的“数据约定”，不是数据库 schema。
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  notebook: string;
  updatedAt: string;
}

// 用 children 表示任意层级；只有 note 节点携带 noteId。
export type TreeNode =
  | { id: string; name: string; kind: 'notebook' | 'folder'; children: TreeNode[] }
  | { id: string; name: string; kind: 'note'; noteId: string };

export interface Backlink { noteId: string; title: string; excerpt: string; notebook: string }
export interface GraphNode { id: string; title: string }
export interface GraphData { nodes: GraphNode[]; edges: { source: string; target: string }[] }
export interface Preferences { fontSize: number; showLineNumbers: boolean }
export interface NoteQuery { query?: string; tag?: string }
````

## src/vite-env.d.ts

````typescript
/// <reference types="vite/client" />
````

## tests/delete.spec.ts

````typescript
import { test, expect } from './fixtures';

test('取消删除不发请求；确认后204、清理文件树并持久化，等待时禁止重复操作', async ({ page, request, backend }) => {
  const keep = await (await request.post('/api/notes', { data: { title: '保留笔记' } })).json();
  const target = await (await request.post('/api/notes', { data: { title: '删除目标' } })).json();
  await page.goto('/notes/' + target.id);
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByRole('textbox', { name: '笔记正文' }).fill('未保存的输入');
  let deletions = 0;
  page.on('request', r => { if (r.method() === 'DELETE') deletions++; });
  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain('无法撤销');
    expect(dialog.message()).toContain('未保存的草稿');
    await dialog.dismiss();
  });
  await page.getByRole('button', { name: '删除笔记', exact: true }).click();
  expect(deletions).toBe(0);
  await expect(page.getByRole('textbox', { name: '笔记正文' })).toHaveValue('未保存的输入');
  expect((await request.get('/api/notes/' + target.id)).status()).toBe(200);
  let release!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const waiting = new Promise<void>(resolve => { entered = resolve; });
  await page.route('**/api/notes/' + target.id, async route => {
    if (route.request().method() === 'DELETE') { entered(); await gate; }
    await route.continue();
  });
  const response = page.waitForResponse(r => r.request().method() === 'DELETE');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '删除笔记', exact: true }).click();
  await waiting;
  await expect(page.getByRole('button', { name: '删除中', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '保存', exact: true })).toBeDisabled();
  await expect(page.getByRole('textbox', { name: '笔记正文' })).toBeDisabled();
  release();
  const deleted = await response;
  expect(deleted.status()).toBe(204);
  // Chrome不保证为204提供可读取的body；空响应已由独立真实HTTP检查验证。
  expect(deletions).toBe(1);
  await expect(page).toHaveURL(new RegExp('/notes/' + keep.id + '$'));
  await expect(page.getByRole('navigation', { name: '笔记本与文档' }).getByRole('link', { name: '删除目标', exact: true })).toHaveCount(0);
  await expect(page.getByText('1 篇笔记', { exact: true })).toBeVisible();
  await backend.restart(); await page.reload();
  await expect(page.getByRole('heading', { name: '保留笔记', exact: true })).toBeVisible();
  expect((await request.get('/api/notes/' + target.id)).status()).toBe(404);
  await page.goto('/search?q=删除目标');
  await expect(page.getByText('找到 0 篇笔记', { exact: true })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: /删除目标/ })).toHaveCount(0);
});

test('删除最后一篇回到空入口，文档导航不会再打开已删除编号', async ({ page, request }) => {
  const note = await (await request.post('/api/notes', { data: { title: '最后一篇' } })).json();
  await page.goto('/notes/' + note.id);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '删除笔记', exact: true }).click();
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
  await expect(page.getByText('0 篇笔记', { exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: '功能模块' }).getByRole('link', { name: '搜索', exact: true }).click();
  await page.getByRole('navigation', { name: '功能模块' }).getByRole('link', { name: '文档', exact: true }).click();
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
});

test('删除时服务中断保留笔记和草稿，恢复后可重试', async ({ page, request, backend }) => {
  const note = await (await request.post('/api/notes', { data: { title: '断线笔记' } })).json();
  await page.goto('/notes/' + note.id);
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByRole('textbox', { name: '笔记正文' }).fill('删除失败也要留住');
  await backend.stop();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '删除笔记', exact: true }).click();
  await expect(page.getByText(/笔记服务.*响应|无法连接笔记服务/).first()).toBeVisible();
  await expect(page.getByRole('textbox', { name: '笔记正文' })).toHaveValue('删除失败也要留住');
  await expect(page.getByRole('navigation', { name: '笔记本与文档' }).getByRole('link', { name: '断线笔记', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '删除笔记', exact: true })).toBeEnabled();
  await backend.restart();
  expect((await request.get('/api/notes/' + note.id)).status()).toBe(200);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '删除笔记', exact: true }).click();
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
});

test('笔记已在其他页面删除时显示404，当前草稿保留', async ({ page, request }) => {
  const note = await (await request.post('/api/notes', { data: { title: '已删除笔记' } })).json();
  await page.goto('/notes/' + note.id);
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByRole('textbox', { name: '笔记正文' }).fill('仍可复制的草稿');
  expect((await request.delete('/api/notes/' + note.id)).status()).toBe(204);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '删除笔记', exact: true }).click();
  await expect(page.getByText('笔记不存在', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: '笔记正文' })).toHaveValue('仍可复制的草稿');
  await expect(page.getByRole('button', { name: '删除笔记', exact: true })).toBeEnabled();
});
````

## tests/desktop.spec.ts

````typescript
import { test, expect } from './fixtures';

test('空数据库显示入口，新建返回201完整笔记并进入真实文件树', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
  const response = page.waitForResponse(r => r.url().endsWith('/api/notes') && r.request().method() === 'POST');
  await page.getByRole('button', { name: '创建第一篇笔记' }).click();
  const created = await response;
  expect(created.status()).toBe(201);
  const note = await created.json();
  expect(Object.keys(note).sort()).toEqual(['id', 'title', 'content', 'tags', 'notebook', 'updatedAt'].sort());
  await expect(page).toHaveURL(new RegExp('/notes/' + note.id + '$'));
  await expect(page.getByRole('heading', { name: '未命名笔记', exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '笔记本与文档' }).getByRole('link', { name: '未命名笔记' })).toBeVisible();
  expect((await (await page.request.get('/api/notes')).json()).length).toBe(1);
});

test('真实笔记切换保留布局、草稿及历史导航，文件夹可折叠', async ({ page, request }) => {
  const a = await (await request.post('/api/notes', { data: { title: '第一篇' } })).json();
  const b = await (await request.post('/api/notes', { data: { title: '第二篇' } })).json();
  await page.goto('/notes/' + a.id);
  await expect(page.getByRole('heading', { name: '第一篇', exact: true })).toBeVisible();
  await page.evaluate(() => { Object.assign(window, { testHeader: document.querySelector('header') }); });
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByRole('textbox', { name: '笔记标题' }).fill('未保存草稿');
  const tree = page.getByRole('navigation', { name: '笔记本与文档' });
  await tree.getByRole('link', { name: '第二篇', exact: true }).click();
  await expect(page.getByRole('heading', { name: '第二篇', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: '未保存草稿', exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { testHeader?: Element }).testHeader === document.querySelector('header'))).toBe(true);
  await page.goForward(); await expect(page).toHaveURL(new RegExp(b.id + '$'));
  await tree.getByRole('button', { name: '收件箱', exact: true }).click();
  await expect(tree.getByRole('link', { name: '第一篇', exact: true })).toBeHidden();
  await tree.getByRole('button', { name: '收件箱', exact: true }).click();
  await expect(tree.getByRole('link', { name: '第二篇', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('真实保存后刷新和后端进程重启仍保留，HTML安全显示', async ({ page, backend }) => {
  await page.goto('/'); await page.getByRole('button', { name: '创建第一篇笔记' }).click();
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByRole('textbox', { name: '笔记标题' }).fill('  持久化验收  ');
  await page.getByRole('textbox', { name: '笔记正文' }).fill('## 我的正文\n\n<script>alert("unsafe")</script>');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByText('已保存到本机数据库', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '笔记本与文档' }).getByRole('link', { name: '持久化验收', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '持久化验收', exact: true })).toBeVisible();
  await expect(page.getByText('<script>alert("unsafe")</script>', { exact: true })).toBeVisible();
  expect(await page.locator('article script').count()).toBe(0);
  await backend.restart(); await page.reload();
  await expect(page.getByRole('heading', { name: '持久化验收', exact: true })).toBeVisible();
  await expect(page.getByText('<script>alert("unsafe")</script>', { exact: true })).toBeVisible();
});

test('422与服务中断保留草稿，重新连接后可保存', async ({ page, backend }) => {
  await page.goto('/'); await page.getByRole('button', { name: '创建第一篇笔记' }).click();
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByRole('textbox', { name: '笔记标题' }).fill('   ');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByText('标题不能为空', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: '笔记标题' })).toHaveValue('   ');
  await page.getByRole('textbox', { name: '笔记标题' }).fill('恢复后的草稿');
  await page.getByRole('textbox', { name: '笔记正文' }).fill('服务中断也要保留');
  await backend.stop();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByText(/笔记服务.*响应|无法连接笔记服务/).first()).toBeVisible();
  await expect(page.getByRole('textbox', { name: '笔记正文' })).toHaveValue('服务中断也要保留');
  await backend.restart();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByText('已保存到本机数据库', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '恢复后的草稿', exact: true })).toBeVisible();
});

test('搜索与标签视图使用真实笔记，设置和模拟同步范围明确', async ({ page, request }) => {
  const note = await (await request.post('/api/notes', { data: { title: 'Python实践' } })).json();
  await request.patch('/api/notes/' + note.id, { data: { title: 'Python实践', content: 'sqlite持久化' } });
  await page.goto('/search');
  await page.getByRole('textbox', { name: '搜索笔记' }).fill('sqlite');
  await expect(page.getByRole('main').getByRole('link', { name: /Python实践/ })).toBeVisible();
  await page.getByRole('textbox', { name: '搜索笔记' }).fill('没有的内容zzzz');
  await expect(page.getByText('没有匹配的笔记，换一个关键词试试。')).toBeVisible();
  await page.getByRole('navigation', { name: '功能模块' }).getByRole('link', { name: '标签', exact: true }).click();
  await expect(page.getByText('1 篇相关笔记', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '打开设置' }).click();
  await page.getByRole('combobox', { name: '正文字号' }).selectOption('20');
  await expect(page.getByText('偏好已应用 · 仅当前会话')).toBeVisible();
  await page.getByRole('checkbox', { name: '源码编辑时显示行号' }).check();
  await page.getByRole('navigation', { name: '功能模块' }).getByRole('link', { name: '文档', exact: true }).click();
  await expect(page.locator('article')).toHaveCSS('font-size', '20px');
  await page.getByRole('button', { name: '模拟同步' }).click();
  await expect(page.getByText('模拟同步完成 · 尚未连接云端')).toBeVisible();
  await expect(page.getByText('反链分析尚未接入，当前仅显示笔记本身。')).toBeVisible();
});

test('未知笔记404、未知页面和服务不可用均有恢复入口', async ({ page, backend }) => {
  await page.goto('/notes/missing'); await expect(page.getByRole('heading', { name: '无法打开笔记' })).toBeVisible();
  await page.getByRole('link', { name: '返回开始页' }).click();
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
  await page.goto('/unknown'); await expect(page.getByRole('heading', { name: '没有找到这个页面' })).toBeVisible();
  await backend.stop(); await page.goto('/');
  await expect(page.getByRole('heading', { name: '无法读取笔记' })).toBeVisible();
  await backend.restart();
  await page.getByRole('main').getByRole('button', { name: '重新连接' }).click();
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
});

test('390px窄屏无横向溢出，侧栏可打开，正文可编辑', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/'); await page.getByRole('button', { name: '创建第一篇笔记' }).click();
  await expect(page.getByRole('heading', { name: '未命名笔记', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: '显示文件树' }).click();
  await expect(page.getByRole('navigation', { name: '笔记本与文档' })).toBeVisible();
  await page.getByRole('button', { name: '隐藏文件树' }).click();
  await page.getByRole('button', { name: '显示反链面板' }).click();
  await expect(page.getByRole('complementary', { name: '反链面板' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
````

## tests/fixtures.ts

````typescript
import { test as base, expect } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';

type Backend = { restart: () => Promise<void>; stop: () => Promise<void> };
export const test = base.extend<{ backend: Backend }>({
  backend: [async ({}, use) => {
    const directory = await mkdtemp(join(tmpdir(), 'rock-notes-e2e-'));
    let child: ChildProcess | undefined;
    let logs = '';
    async function stop() {
      if (!child || child.exitCode !== null || child.signalCode !== null) return;
      const current = child;
      await new Promise<void>(done => {
        const timer = setTimeout(() => current.kill('SIGKILL'), 5000);
        current.once('close', () => { clearTimeout(timer); done(); });
        current.kill('SIGTERM');
      });
      child = undefined;
    }
    async function start() {
      await rm(join(directory, 'backend-ready'), { force: true });
      logs = '';
      child = spawn(resolve('../.venv/bin/python'), ['-B', 'tests/run-backend.py'], {
        env: { ...process.env, ROCK_E2E_DATA_DIR: directory }, stdio: ['ignore', 'pipe', 'pipe'],
      });
      child.stderr?.on('data', value => { logs += value.toString(); });
      child.on('error', error => { logs += error.message; });
      const deadline = Date.now() + 10000;
      while (Date.now() < deadline) {
        if (child.exitCode !== null || child.signalCode !== null) throw new Error('临时后端退出：' + logs);
        try {
          await access(join(directory, 'backend-ready'));
          if ((await fetch('http://127.0.0.1:18000/health')).ok) return;
        } catch {}
        await new Promise(done => setTimeout(done, 50));
      }
      throw new Error('临时后端未启动：' + logs);
    }
    try {
      await start();
      await use({ stop, restart: async () => { await stop(); await start(); } });
    } finally { await stop(); await rm(directory, { recursive: true, force: true }); }
  }, { auto: true }],
});
export { expect };
````

## tests/ime.spec.ts

````typescript
import { test, expect } from './fixtures';
import type { Page, Locator } from '@playwright/test';

// 使用浏览器原生组合输入协议；不是 fill 或直接粘贴中文。
async function compose(page: Page, input: Locator, text: string, duringComposition?: () => Promise<void>) {
  await input.focus();
  const client = await page.context().newCDPSession(page);
  await input.evaluate(element => {
    const events: string[] = [];
    Object.assign(element, { imeEvents: events });
    for (const type of ['compositionstart', 'compositionupdate', 'compositionend']) {
      element.addEventListener(type, () => events.push(type));
    }
  });
  for (const part of ['n', 'ni', 'nihao']) {
    await client.send('Input.imeSetComposition', { text: part, selectionStart: part.length, selectionEnd: part.length });
    await expect(input).toHaveValue(part);
    if (duringComposition) await duringComposition();
  }
  await client.send('Input.insertText', { text });
  await expect(input).toHaveValue(text);
  const events = await input.evaluate(element => (element as HTMLElement & { imeEvents: string[] }).imeEvents);
  expect(events).toContain('compositionstart');
  expect(events).toContain('compositionend');
  await client.detach();
}

test('中文组合输入：标题与正文完成选词后可保存并刷新', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '创建第一篇笔记' }).click();
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  const title = page.getByRole('textbox', { name: '笔记标题' });
  await title.fill('');
  await compose(page, title, '你好');
  await compose(page, page.getByRole('textbox', { name: '笔记正文' }), '你好');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByText('已保存到本机数据库', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '你好', exact: true })).toBeVisible();
  await expect(page.locator('article p').filter({ hasText: /^你好$/ })).toBeVisible();
});

test('中文组合输入：搜索选词后正确显示中文查询', async ({ page, request }) => {
  await request.post('/api/notes', { data: { title: '你好' } });
  await page.goto('/search');
  await compose(page, page.getByRole('textbox', { name: '搜索笔记' }), '你好', async () => {
    await expect(page).toHaveURL(/\/search$/);
  });
  await expect(page).toHaveURL(/q=%E4%BD%A0%E5%A5%BD/);
  await expect(page.getByRole('main').getByRole('link', { name: /你好/ })).toBeVisible();
});
````

## tests/run-backend.py

````python
"""仅供端到端测试：所有数据库操作隔离到临时目录，不改后端源码。"""
import os
import sys
import socket
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[2]
data = Path(os.environ['ROCK_E2E_DATA_DIR']).resolve()
if not data.is_relative_to(Path(tempfile.gettempdir()).resolve()) or not data.name.startswith('rock-notes-e2e-'):
    raise RuntimeError('端到端数据库必须位于专用临时目录')
os.chdir(data)
sys.path.insert(0, str(root))
sys.dont_write_bytecode = True
import notes_database
notes_database.DB_PATH = data / 'learning.db'
# 旧database模块使用相对路径；此时工作目录也已切到临时目录。
import main
import uvicorn
# 先独占测试端口，再写就绪标记；端口被占用时不会误用其他服务。
listener = socket.socket()
listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
listener.bind(('127.0.0.1', 18000))
(data / 'backend-ready').write_text(str(os.getpid()))
server = uvicorn.Server(uvicorn.Config(main.app, log_level='critical', access_log=False))
server.run(sockets=[listener])
````

## tests/search.spec.ts

````typescript
import { test, expect } from './fixtures';

test('按输入顺序匹配：忽略查询空白、允许隔字，不能倒序或只命中部分字符', async ({ page, request }) => {
  for (const note of [
    { title: '笔记甲', content: '今天好开心 aaa' },
    { title: '笔记乙', content: 'aaa，今天好开心' },
    { title: '笔记丙', content: '今天好开心' },
  ]) {
    const created = await request.post('/api/notes', { data: { title: note.title } });
    expect(created.status()).toBe(201);
    const { id } = await created.json();
    expect((await request.patch('/api/notes/' + id, { data: note })).status()).toBe(200);
  }
  await page.goto('/search');
  const search = page.getByRole('textbox', { name: '搜索笔记' });
  const results = page.getByRole('main');
  await search.fill('今天 a');
  await expect(page.getByText('找到 1 篇笔记', { exact: true })).toBeVisible();
  await expect(results.getByRole('heading', { name: '笔记甲', exact: true })).toBeVisible();
  await expect(results.getByRole('heading', { name: '笔记乙', exact: true })).toHaveCount(0);
  await search.fill('a 今天');
  await expect(page.getByText('找到 1 篇笔记', { exact: true })).toBeVisible();
  await expect(results.getByRole('heading', { name: '笔记乙', exact: true })).toBeVisible();
  await search.fill(' 　今   开 A  ');
  await expect(page.getByText('找到 1 篇笔记', { exact: true })).toBeVisible();
  await expect(results.getByRole('heading', { name: '笔记甲', exact: true })).toBeVisible();
  for (const query of ['天今 a', '今天 z', '今天 aaaa']) {
    await search.fill(query);
    await expect(page.getByText('没有匹配的笔记，换一个关键词试试。')).toBeVisible();
  }
  await search.fill(' 　');
  await expect(page.getByText('找到 3 篇笔记', { exact: true })).toBeVisible();
});
````

## tsconfig.json

````json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src", "vite.config.ts"]
}
````

## vite.config.ts

````typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// 开发时把同源 /api 请求转发给 FastAPI；生产部署需另外配置反向代理。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'ROCK_');
  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1', port: 5173, strictPort: true,
      proxy: { '/api': { target: env.ROCK_API_TARGET || 'http://127.0.0.1:8000' } },
    },
  };
});
````
