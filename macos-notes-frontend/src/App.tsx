import { Route, Routes } from 'react-router-dom';
import { DesktopLayout } from './components/DesktopLayout';
import { EditorPage } from './pages/EditorPage';
import { NotesHome } from './pages/NotesHome';
import { SearchPage, TagsPage, SettingsPage, NotFoundPage } from './pages/UtilityPages';

export function App() {
  return <Routes><Route element={<DesktopLayout />}>
    <Route index element={<NotesHome />} />
    <Route path="notes" element={<NotesHome />} />
    <Route path="notes/:noteId" element={<EditorPage />} />
    <Route path="search" element={<SearchPage />} />
    <Route path="tags" element={<TagsPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes>;
}
