import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Lazy load components
const SafetyCenter = React.lazy(() => import('@/components/safety/SafetyCenter'));
const LoginPage = React.lazy(() => import('@/pages/login'));

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/safety"
          element={
            <PrivateRoute>
              <SafetyCenter />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/safety" replace />} />
      </Routes>
    </React.Suspense>
  );
};
