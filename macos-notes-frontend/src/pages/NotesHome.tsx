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
