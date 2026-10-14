import { Navigate, Route, Routes } from 'react-router-dom';
import { DesktopLayout } from './components/DesktopLayout';
import { EditorPage } from './pages/EditorPage';
import { SearchPage, TagsPage, SettingsPage, NotFoundPage } from './pages/UtilityPages';

// 共用四栏窗口是父路由，功能界面通过父布局的 Outlet 显示。
export function App() {
  return <Routes><Route element={<DesktopLayout />}>
    <Route index element={<Navigate to="/notes/welcome" replace />} />
    <Route path="notes/:noteId" element={<EditorPage />} />
    <Route path="search" element={<SearchPage />} />
    <Route path="tags" element={<TagsPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes>;
}
