import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import styles from '../styles/Desktop.module.css';

// 统一图标尺寸和可访问名称；不把只有图标的按钮留给用户猜。
export function IconButton({ icon: Icon, label, active = false, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string; active?: boolean }) {
  return <button type="button" className={`${styles.iconButton} ${active ? styles.iconActive : ''}`} title={label} aria-label={label} {...props}><Icon size={18} strokeWidth={1.6} /></button>;
}
