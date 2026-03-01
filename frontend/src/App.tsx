import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/layout/Header';
import { TabBar } from './components/layout/TabBar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Skeleton } from './components/common/Skeleton';

const MapPage = lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })));
const ExplorePage = lazy(() => import('./pages/ExplorePage').then(m => ({ default: m.ExplorePage })));
const RoadmapListPage = lazy(() => import('./pages/RoadmapListPage').then(m => ({ default: m.RoadmapListPage })));
const PostListPage = lazy(() => import('./pages/PostListPage').then(m => ({ default: m.PostListPage })));

function PageLoader() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
      <Skeleton variant="rectangular" className="w-full h-8" />
      <Skeleton variant="rectangular" className="w-full h-64" />
      <Skeleton variant="rectangular" className="w-3/4 h-4" />
    </div>
  );
}
export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-surface-dark">
            <Header />
            <TabBar />
            <main className="flex-1">
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<MapPage />} />
                    <Route path="/explore" element={<ExplorePage />} />
                    <Route path="/roadmaps" element={<RoadmapListPage />} />
                    <Route path="/posts" element={<PostListPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
          </div>
        </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  );
}
