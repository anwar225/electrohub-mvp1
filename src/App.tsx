import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';
import { Login, Signup } from '@/pages/Auth';
import { lazy, Suspense, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';

const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const FournisseursPage = lazy(() => import('@/pages/FournisseursPage').then((m) => ({ default: m.FournisseursPage })));
const VentesPage = lazy(() => import('@/pages/VentesPage').then((m) => ({ default: m.VentesPage })));
const StockPage = lazy(() => import('@/pages/StockPage').then((m) => ({ default: m.StockPage })));
const AdminPage = lazy(() => import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })));

function PageFallback() {
  return (
    <div className="space-y-4 p-1">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function Protected({ children }: { children: ReactNode }) {
  const authStore = useAuthStore();
  const token = authStore.token;

  if (!token || token.startsWith('mock-jwt-')) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            element={
              <Protected>
                <Layout />
              </Protected>
            }
          >
            <Route path="/dashboard" element={<Suspense fallback={<PageFallback />}><Dashboard /></Suspense>} />
            <Route path="/fournisseurs" element={<Suspense fallback={<PageFallback />}><FournisseursPage /></Suspense>} />
            <Route path="/ventes" element={<Suspense fallback={<PageFallback />}><VentesPage /></Suspense>} />
            <Route path="/stock" element={<Suspense fallback={<PageFallback />}><StockPage /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={<PageFallback />}><AdminPage /></Suspense>} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
