import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy load pages
const SafetyPage = React.lazy(() => import('@/pages/safety'));
const LoginPage = React.lazy(() => import('@/pages/login'));
const ProfilePage = React.lazy(() => import('@/pages/profile'));
const MatchingPage = React.lazy(() => import('@/pages/matching'));
const ChatPage = React.lazy(() => import('@/pages/chat'));

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/safety"
          element={
            <PrivateRoute>
              <SafetyPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/matching"
          element={
            <PrivateRoute>
              <MatchingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/matching" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
