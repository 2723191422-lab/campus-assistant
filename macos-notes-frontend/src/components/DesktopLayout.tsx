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
  const [lastNote, setLastNote] = useState('welcome');
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
    try { const note = await store.create(); navigate(`/notes/${note.id}`); setToast('已在收件箱创建示例笔记'); }
    catch (error) { setToast(error instanceof Error ? error.message : '创建失败'); }
    finally { setCreating(false); }
  }
  return <div className={styles.desktop}><div className={styles.window}>
    {/* 组件：共用半透明工具栏，始终跨越四栏。窗口圆点是装饰，不伪装关闭功能。 */}
    <header className={styles.toolbar}>
      <div className={styles.toolbarLeft}><div className={styles.trafficLights} aria-hidden="true"><i /><i /><i /></div><span className={styles.appName}>岩笺<span>Notes</span></span><IconButton icon={PanelLeft} label={left ? '隐藏文件树' : '显示文件树'} aria-pressed={left} onClick={() => setLeft(!left)} /></div>
      <button className={styles.quickSearch} onClick={() => navigate('/search')}><Search size={15} /><span>搜索你的笔记</span><kbd>⌘ K</kbd></button>
      <div className={styles.toolbarRight}><span className={styles.mockBadge}>MOCK 工作区</span><IconButton icon={RefreshCw} label="模拟同步" disabled={busy} className={`${styles.iconButton} ${busy ? styles.spinning : ''}`} onClick={sync} /><IconButton icon={PanelRight} label={right ? '隐藏反链面板' : '显示反链面板'} aria-pressed={right} onClick={() => setRight(!right)} /><IconButton icon={Settings} label="打开设置" onClick={() => navigate('/settings')} /></div>
    </header>
    {/* 组件：四栏布局。侧栏隐藏后不占宽度，中间区域 flex:1 自动扩展。 */}
    <div className={styles.body}>
      <nav className={styles.rail} aria-label="功能模块"><div className={styles.railLogo}><Layers size={22} strokeWidth={1.5} /></div>
        {modules.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to === '/notes' ? `/notes/${lastNote}` : to} title={label} aria-label={label} className={() => `${styles.railButton} ${location.pathname.startsWith(to) ? styles.railSelected : ''}`} aria-current={location.pathname.startsWith(to) ? 'page' : undefined}><Icon size={20} strokeWidth={1.6} /></NavLink>)}
        <div className={styles.railBottom}><NavLink to="/settings" aria-label="设置" title="设置" className={({ isActive }) => `${styles.railButton} ${isActive ? styles.railSelected : ''}`}><Settings size={20} strokeWidth={1.6} /></NavLink><Link className={styles.avatar} to="/settings" title="工作区设置">R</Link></div>
      </nav>
      <aside className={`${styles.sidebar} ${left ? '' : styles.panelHidden}`} aria-label="文件树面板" aria-hidden={!left} inert={!left}>
        <div className={styles.workspaceName}><span className={styles.workspaceIcon}>R</span><div><strong>Rock 的知识空间</strong><small>给想法一个安静的地方</small></div><ChevronDown size={13} aria-hidden="true" /></div>
        <div className={styles.sidebarHeading}><span>笔记本</span><IconButton icon={Plus} label="新建笔记" disabled={creating || store.loading} onClick={create} /></div>
        {store.loading ? <p className={styles.panelHint}>正在读取笔记本…</p> : store.error ? <p role="alert" className={styles.panelHint}>{store.error}</p> : <FileTree nodes={store.tree} />}
        <div className={styles.sidebarFooter}><span><Check size={13} />{store.notes.length} 篇示例笔记</span><small>仅当前浏览器会话</small></div>
      </aside>
      <main className={styles.main} id="main-content"><Outlet /></main>
      <aside className={`${styles.backlinks} ${right ? '' : styles.panelHidden}`} aria-label="反链面板" aria-hidden={!right} inert={!right}><BacklinksPanel noteId={noteId} /></aside>
    </div>
    {toast && <div className={styles.toast} role="status">{toast}</div>}
  </div></div>;
}
