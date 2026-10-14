import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import type { TreeNode } from '../types';
import styles from '../styles/Desktop.module.css';

// 递归的关键：分组节点再次渲染 TreeItem；文档节点是递归的终点。
function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  if (node.kind === 'note') return <li>
    <NavLink to={`/notes/${node.noteId}`} title={node.name} className={({ isActive }) => `${styles.treeRow} ${isActive ? styles.treeSelected : ''}`} style={{ paddingLeft: 12 + depth * 14 }}>
      <FileText size={15} strokeWidth={1.5} /><span>{node.name}</span>
    </NavLink>
  </li>;
  const Icon = node.kind === 'notebook' ? BookOpen : Folder;
  return <li>
    <button className={`${styles.treeRow} ${depth === 0 ? styles.treeRoot : ''}`} style={{ paddingLeft: 8 + depth * 14 }} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
      {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}<Icon size={15} strokeWidth={1.5} /><span>{node.name}</span>
    </button>
    {/* 保留子组件而使用 hidden，父文件夹折叠时不会重置子文件夹的状态。 */}
    <ul className={styles.treeList} hidden={!expanded}>{node.children.map(child => <TreeItem key={child.id} node={child} depth={depth + 1} />)}</ul>
  </li>;
}
export function FileTree({ nodes }: { nodes: TreeNode[] }) {
  return <nav aria-label="笔记本与文档"><ul className={styles.treeList}>{nodes.map(node => <TreeItem key={node.id} node={node} />)}</ul></nav>;
}
