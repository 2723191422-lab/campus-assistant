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
