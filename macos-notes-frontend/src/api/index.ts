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
