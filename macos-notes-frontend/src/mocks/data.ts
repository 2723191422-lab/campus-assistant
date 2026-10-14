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
