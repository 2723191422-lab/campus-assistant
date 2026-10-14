import { useEffect, useState } from 'react';
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
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false; setLoading(true); setError('');
    listNotes({ query }).then(value => { if (!cancelled) setNotes(value); }).catch((cause: unknown) => { if (!cancelled) setError(cause instanceof Error ? cause.message : '搜索失败'); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [query]);
  return <section className={styles.utilityPage}><p className={styles.eyebrow}>FIND AN IDEA</p><h1>搜索你的知识</h1><p className={styles.subtitle}>一个词，也许就是一个新连接的起点。</p><label className={styles.searchInput}><Search size={19} /><input autoFocus aria-label="搜索笔记" placeholder="搜索标题或正文…" value={query} onChange={event => setParams(event.target.value ? { q: event.target.value } : {}, { replace: true })} /></label><p className={styles.resultCount} role="status">{loading ? '正在搜索…' : error || `找到 ${notes.length} 篇笔记`}</p>{!loading && !error && <><Results notes={notes} />{!notes.length && <p className={styles.emptyText}>没有匹配的笔记，换一个关键词试试。</p>}</>}</section>;
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
  return <section className={styles.utilityPage}><p className={styles.eyebrow}>MAKE IT YOURS</p><h1>你的书写空间</h1><p className={styles.subtitle}>少一点干扰，多一点专注。</p><div className={styles.settingsCard}><h2><SlidersHorizontal size={18} />编辑器</h2><label>正文字号<select aria-label="正文字号" disabled={busy} value={preferences.fontSize} onChange={event => void change({ ...preferences, fontSize: Number(event.target.value) })}>{[14, 16, 18, 20, 22].map(size => <option key={size} value={size}>{size} px</option>)}</select></label><label>源码编辑时显示行号<input type="checkbox" checked={preferences.showLineNumbers} disabled={busy} onChange={event => void change({ ...preferences, showLineNumbers: event.target.checked })} /></label></div><div className={styles.settingsCard}><h2><Monitor size={18} />关于工作区</h2><p>岩笺 · React + TypeScript 前端原型</p><p>所有笔记、反链和同步均为 mock。模拟保存只保留到刷新前，没有连接服务器、云端或数据库。</p></div><p role="status" className={styles.saveMessage}>{status}</p></section>;
}
export function NotFoundPage() { return <section className={styles.utilityPage}><h1>没有找到这个页面</h1><p>这个地址没有对应的功能。</p><Link to="/notes/welcome">返回笔记</Link></section>; }
