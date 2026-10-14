import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { NotesProvider } from './state/NotesContext';
import { App } from './App';
import './styles/global.css';

// BrowserRouter 使用浏览器历史，Link/导航不会整页刷新。
createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><NotesProvider><App /></NotesProvider></BrowserRouter></StrictMode>
);
