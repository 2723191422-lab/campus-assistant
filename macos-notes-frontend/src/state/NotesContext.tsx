import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as api from '../api';
import type { Note, TreeNode, Preferences } from '../types';

type Draft = Pick<Note, 'title' | 'content'>;
interface Store {
  tree: TreeNode[]; notes: Note[]; loading: boolean; error: string;
  drafts: Record<string, Draft>; preferences: Preferences;
  patchDraft: (note: Note, patch: Partial<Draft>) => void;
  save: (id: string, draft: Draft) => Promise<void>;
  create: () => Promise<Note>;
  refresh: () => Promise<void>;
  setPreferences: (value: Preferences) => Promise<void>;
}
const Context = createContext<Store | null>(null);

// 父级状态不随子路由卸载；未保存草稿按文档 id 分开，避免切换文档丢失输入。
export function NotesProvider({ children }: { children: ReactNode }) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [preferences, setPreferenceState] = useState<Preferences>({ fontSize: 16, showLineNumbers: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function refresh() {
    const [nextTree, nextNotes] = await Promise.all([api.getNotebooks(), api.listNotes()]);
    setTree(nextTree); setNotes(nextNotes);
  }
  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getNotebooks(), api.listNotes(), api.getPreferences()]).then(([nextTree, nextNotes, prefs]) => {
      if (!cancelled) { setTree(nextTree); setNotes(nextNotes); setPreferenceState(prefs); }
    }).catch((cause: unknown) => { if (!cancelled) setError(cause instanceof Error ? cause.message : '资料加载失败'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  function patchDraft(note: Note, patch: Partial<Draft>) {
    setDrafts(previous => ({ ...previous, [note.id]: { ...(previous[note.id] ?? { title: note.title, content: note.content }), ...patch } }));
  }
  async function save(id: string, draft: Draft) {
    await api.updateNote(id, draft);
    // 仅清理刚保存的版本；等待响应时的新输入仍然保留。
    setDrafts(previous => {
      if (previous[id]?.title !== draft.title || previous[id]?.content !== draft.content) return previous;
      const next = { ...previous }; delete next[id]; return next;
    });
    await refresh();
  }
  async function create() { const note = await api.createNote({ title: '未命名笔记' }); await refresh(); return note; }
  async function setPreferences(value: Preferences) {
    // 控件立即响应用户点击；若接口失败，恢复原值并交给页面显示错误。
    const previous = preferences;
    setPreferenceState(value);
    try { setPreferenceState(await api.updatePreferences(value)); }
    catch (cause) { setPreferenceState(previous); throw cause; }
  }
  return <Context.Provider value={{ tree, notes, drafts, preferences, loading, error, patchDraft, save, create, refresh, setPreferences }}>{children}</Context.Provider>;
}
export function useNotes() {
  const store = useContext(Context);
  if (!store) throw new Error('useNotes 必须在 NotesProvider 内使用');
  return store;
}
