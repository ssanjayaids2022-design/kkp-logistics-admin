import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import { luxuryGoldTheme } from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import LoginScreen from './pages/LoginScreen';
import DashboardScreen from './pages/DashboardScreen';
import LoadListScreen from './pages/LoadListScreen';
import LoadPostingScreen from './pages/LoadPostingScreen';
import BidComparisonScreen from './pages/BidComparisonScreen';
import DriverApprovalScreen from './pages/DriverApprovalScreen';
import PaymentListScreen from './pages/PaymentListScreen';
import ProfileScreen from './pages/ProfileScreen';
import SettingsScreen from './pages/SettingsScreen';
import { LoadsProvider } from './context/LoadsContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';

// ─── Lazy-loaded Analytics Pages ─────────────────────────────────────────────
const PredictiveAnalytics = React.lazy(() => import('./pages/PredictiveAnalytics'));
const FinancialAnalytics = React.lazy(() => import('./pages/FinancialAnalytics'));
const LoadAnalytics = React.lazy(() => import('./pages/LoadAnalytics'));

const PageLoader = () => (
  <div className="kkp-flex-center" style={{ minHeight: 400 }}>
    <Spin size="large" tip="Loading analytics..." />
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="kkp-flex-center kkp-login-bg kkp-full-vh">
        <Spin size="large" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: ('ADMIN' | 'SUPER_ADMIN' | 'manager' | 'operator')[];
}) {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginScreen />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardScreen />} />
        <Route path="loads" element={<LoadListScreen />} />
        <Route path="loads/new" element={<LoadPostingScreen />} />
        <Route path="bids" element={<BidComparisonScreen />} />
        <Route path="drivers" element={<DriverApprovalScreen />} />
        <Route path="payments" element={<PaymentListScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
        <Route path="settings" element={<SettingsScreen />} />

        {/* ── Analytics Routes (lazy loaded) ── */}
        <Route
          path="analytics/predictive"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN']}>
              <Suspense fallback={<PageLoader />}>
                <PredictiveAnalytics />
              </Suspense>
            </RoleRoute>
          }
        />
        <Route
          path="analytics/financial"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN']}>
              <Suspense fallback={<PageLoader />}>
                <FinancialAnalytics />
              </Suspense>
            </RoleRoute>
          }
        />
        <Route
          path="analytics/loads"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <Suspense fallback={<PageLoader />}>
                <LoadAnalytics />
              </Suspense>
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ConfigProvider theme={luxuryGoldTheme}>
      <AntApp>
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <LoadsProvider>
                <NotificationProvider>
                  <AppRoutes />
                </NotificationProvider>
              </LoadsProvider>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
