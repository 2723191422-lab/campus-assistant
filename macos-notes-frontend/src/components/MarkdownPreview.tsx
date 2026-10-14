import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Desktop.module.css';

// 最小安全预览：文本由 React 转义，不使用 dangerouslySetInnerHTML。
// 支持标题、引用、列表、段落、[[id|名称]]；不声称实现完整 Markdown 规范。
function inline(text: string): ReactNode[] {
  return text.split(/(\[\[[^\]]+\]\])/g).map((part, index) => {
    const match = part.match(/^\[\[([\w-]+)(?:\|([^\]]+))?\]\]$/);
    return match ? <Link key={index} to={`/notes/${match[1]}`} className={styles.wikiLink}>{match[2] ?? match[1]}</Link> : <Fragment key={index}>{part}</Fragment>;
  });
}
export function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: ReactNode[] = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line.trim()) continue;
    if (line.startsWith('# ')) { blocks.push(<h2 key={index} className={styles.bodyTitle}>{inline(line.slice(2))}</h2>); continue; }
    if (line.startsWith('## ')) { blocks.push(<h2 key={index}>{inline(line.slice(3))}</h2>); continue; }
    if (line.startsWith('### ')) { blocks.push(<h3 key={index}>{inline(line.slice(4))}</h3>); continue; }
    if (line.startsWith('> ')) { blocks.push(<blockquote key={index}>{inline(line.slice(2))}</blockquote>); continue; }
    if (line.startsWith('- ')) {
      const items: ReactNode[] = []; const start = index;
      while (index < lines.length && lines[index].startsWith('- ')) { items.push(<li key={index}>{inline(lines[index].slice(2))}</li>); index++; }
      index--; blocks.push(<ul key={start}>{items}</ul>); continue;
    }
    blocks.push(<p key={index}>{inline(line)}</p>);
  }
  return <div className={styles.prose}>{blocks}</div>;
}
