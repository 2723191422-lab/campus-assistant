// 前后端共享的“数据约定”，不是数据库 schema。
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  notebook: string;
  updatedAt: string;
}

// 用 children 表示任意层级；只有 note 节点携带 noteId。
export type TreeNode =
  | { id: string; name: string; kind: 'notebook' | 'folder'; children: TreeNode[] }
  | { id: string; name: string; kind: 'note'; noteId: string };

export interface Backlink { noteId: string; title: string; excerpt: string; notebook: string }
export interface GraphNode { id: string; title: string }
export interface GraphData { nodes: GraphNode[]; edges: { source: string; target: string }[] }
export interface Preferences { fontSize: number; showLineNumbers: boolean }
export interface NoteQuery { query?: string; tag?: string }
