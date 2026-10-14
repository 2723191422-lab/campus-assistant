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
      <div hidden={collapsed}>{links.map(link => <Link className={styles.backlinkCard} key={link.noteId} to={`/notes/${link.noteId}`}><div><strong>{link.title}</strong><ArrowUpRight size={14} /></div><p>{link.excerpt}</p><small>{link.notebook}</small></Link>)}{!links.length && <p className={styles.panelHint}>还没有其他笔记链接到这里。</p>}</div>
      <div className={styles.graphHeading}><Network size={14} /><span>局部关系图</span><small>MOCK</small></div>
      {graph && <RelationshipGraph graph={graph} current={noteId} />}
      <p className={styles.graphHint}>点击节点，继续探索一个想法。</p>
      <div className={styles.connectionNote}><Link2 size={17} /><p>每一次连接，<br />都是一次新的理解。</p></div>
    </>}
  </>;
}
