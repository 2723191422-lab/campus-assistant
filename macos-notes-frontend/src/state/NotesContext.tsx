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
