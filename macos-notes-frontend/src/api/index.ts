import { notes, notebooks, incomingLinks, preferences } from '../mocks/data';
import type { Note, TreeNode, Backlink, GraphData, NoteQuery, Preferences } from '../types';

// 模拟存储只存在于浏览器内存。刷新恢复示例；这里不创建服务端或数据库。
let noteStore = structuredClone(notes);
const treeStore = structuredClone(notebooks);
let preferenceStore = structuredClone(preferences);
const respond = async <T,>(data: T): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  // 返回副本，避免组件意外直接修改 mock 存储。
  return structuredClone(data);
};

/** GET /api/notebooks；参数：无；返回：TreeNode[]（递归笔记本/文件夹/文档树）。 */
export async function getNotebooks(): Promise<TreeNode[]> { return respond(treeStore); }

/** GET /api/notes?query=&tag=；参数：NoteQuery；返回：Note[]。 */
export async function listNotes({ query = '', tag = '' }: NoteQuery = {}): Promise<Note[]> {
  const term = query.trim().toLocaleLowerCase();
  return respond(noteStore.filter(note => (!term || (note.title + note.content).toLocaleLowerCase().includes(term)) && (!tag || note.tags.includes(tag))));
}

/** GET /api/notes/:id；路径参数：id:string；返回：Note；不存在则抛错。 */
export async function getNote(id: string): Promise<Note> {
  const note = noteStore.find(item => item.id === id);
  if (!note) throw new Error('这篇笔记不存在，请从文件树重新选择。');
  return respond(note);
}

/** PATCH /api/notes/:id；参数：id、{title:string,content:string}；返回：更新后的 Note。 */
export async function updateNote(id: string, patch: Pick<Note, 'title' | 'content'>): Promise<Note> {
  const note = noteStore.find(item => item.id === id);
  if (!note) throw new Error('笔记不存在，无法保存。');
  if (!patch.title.trim()) throw new Error('标题不能为空。');
  Object.assign(note, patch, { title: patch.title.trim(), updatedAt: new Date().toISOString() });
  function rename(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (node.kind === 'note') { if (node.noteId === id) node.name = note!.title; }
      else rename(node.children);
    }
  }
  rename(treeStore);
  return respond(note);
}

/** POST /api/notes；参数：{title:string}；返回：Note；新记录放入收件箱。 */
export async function createNote(input: { title: string }): Promise<Note> {
  if (!input.title.trim()) throw new Error('标题不能为空。');
  const note: Note = { id: crypto.randomUUID(), title: input.title.trim(), content: '# ' + input.title.trim() + '\n\n在这里开始书写。', tags: [], notebook: '收件箱', updatedAt: new Date().toISOString() };
  noteStore = [...noteStore, note];
  const inbox = treeStore.find(node => node.id === 'inbox-folder');
  if (inbox && inbox.kind !== 'note') inbox.children.push({ id: 'tree-' + note.id, name: note.title, kind: 'note', noteId: note.id });
  return respond(note);
}

/** GET /api/notes/:id/backlinks；参数：id:string；返回：Backlink[]。 */
export async function getBacklinks(id: string): Promise<Backlink[]> {
  const links = (incomingLinks[id] ?? []).flatMap(link => {
    const source = noteStore.find(note => note.id === link.source);
    return source ? [{ noteId: source.id, title: source.title, excerpt: link.excerpt, notebook: source.notebook }] : [];
  });
  return respond(links);
}

/** GET /api/notes/:id/graph；参数：id:string；返回：{nodes:GraphNode[],edges:{source,target}[]}。 */
export async function getGraph(id: string): Promise<GraphData> {
  const center = await getNote(id);
  const links = await getBacklinks(id);
  return respond({ nodes: [{ id: center.id, title: center.title }, ...links.map(link => ({ id: link.noteId, title: link.title }))], edges: links.map(link => ({ source: link.noteId, target: id })) });
}

/** GET /api/tags；参数：无；返回：{name:string,count:number}[]。 */
export async function getTags(): Promise<{ name: string; count: number }[]> {
  const names = [...new Set(noteStore.flatMap(note => note.tags))];
  return respond(names.map(name => ({ name, count: noteStore.filter(note => note.tags.includes(name)).length })));
}

/** GET /api/preferences；参数：无；返回：Preferences。 */
export async function getPreferences(): Promise<Preferences> { return respond(preferenceStore); }

/** PATCH /api/preferences；参数：Preferences；返回：Preferences。 */
export async function updatePreferences(input: Preferences): Promise<Preferences> {
  preferenceStore = { ...input, fontSize: Math.min(22, Math.max(14, input.fontSize)) };
  return respond(preferenceStore);
}

/** POST /api/sync；参数：无；返回：{mode:'mock',syncedAt:string}，仅模拟，不连接云端。 */
export async function syncNotes(): Promise<{ mode: 'mock'; syncedAt: string }> { return respond({ mode: 'mock', syncedAt: new Date().toISOString() }); }
