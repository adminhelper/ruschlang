import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Header } from './components/layout/Header';
import { TabBar } from './components/layout/TabBar';
import { MapPage } from './pages/MapPage';
import { ExplorePage } from './pages/ExplorePage';
import { RoadmapListPage } from './pages/RoadmapListPage';
import { PostListPage } from './pages/PostListPage';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-surface-dark">
            <Header />
            <TabBar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<MapPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/roadmaps" element={<RoadmapListPage />} />
                <Route path="/posts" element={<PostListPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
}
