import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import { luxuryGoldTheme, luxuryGoldDarkTheme } from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { Permission } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AppLayout from './layouts/AppLayout';
import LoginScreen from './pages/LoginScreen';
import DashboardScreen from './pages/DashboardScreen';
import LoadListScreen from './pages/LoadListScreen';
import LoadPostingScreen from './pages/LoadPostingScreen';
import MatchScreen from './pages/MatchScreen';
import MatchLoadScreen from './pages/MatchLoadScreen';
import TrackingScreen from './pages/TrackingScreen';
import DriverApprovalScreen from './pages/DriverApprovalScreen';
import PaymentListScreen from './pages/PaymentListScreen';
import ProfileScreen from './pages/ProfileScreen';
import SettingsScreen from './pages/SettingsScreen';
import NotificationsScreen from './pages/NotificationsScreen';
import { LoadsProvider } from './context/LoadsContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';

// ─── Lazy-loaded Analytics Pages ─────────────────────────────────────────────
const PredictiveAnalytics = React.lazy(() => import('./pages/PredictiveAnalytics'));
const FinancialAnalytics = React.lazy(() => import('./pages/FinancialAnalytics'));
const LoadAnalytics = React.lazy(() => import('./pages/LoadAnalytics'));
const DriverAnalytics = React.lazy(() => import('./pages/DriverAnalytics'));
const TripAnalytics = React.lazy(() => import('./pages/TripAnalytics'));
const PaymentAnalyticsPage = React.lazy(() => import('./pages/PaymentAnalyticsPage'));
const OperationalEfficiency = React.lazy(() => import('./pages/OperationalEfficiency'));
const RouteAnalytics = React.lazy(() => import('./pages/RouteAnalytics'));
const AdminManagement = React.lazy(() => import('./pages/AdminManagement'));
const AuditLogs = React.lazy(() => import('./pages/AuditLogs'));
const AccessMatrix = React.lazy(() => import('./pages/AccessMatrix'));

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

function PermissionRoute({ children, perm }: { children: React.ReactNode; perm: Permission }) {
  const { can } = useAuth();
  if (!can(perm)) {
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
        <Route path="loads" element={<PermissionRoute perm="loads.view"><LoadListScreen /></PermissionRoute>} />
        <Route path="loads/new" element={<PermissionRoute perm="loads.post"><LoadPostingScreen /></PermissionRoute>} />
        <Route path="match" element={<PermissionRoute perm="match.view"><MatchScreen /></PermissionRoute>} />
        <Route path="match/:loadId" element={<PermissionRoute perm="match.view"><MatchLoadScreen /></PermissionRoute>} />
        <Route path="tracking" element={<PermissionRoute perm="tracking.view"><TrackingScreen /></PermissionRoute>} />
        <Route path="drivers" element={<PermissionRoute perm="drivers.view"><DriverApprovalScreen /></PermissionRoute>} />
        <Route path="payments" element={<PermissionRoute perm="payments.view"><PaymentListScreen /></PermissionRoute>} />
        <Route path="profile" element={<ProfileScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
        <Route path="notifications" element={<NotificationsScreen />} />

        {/* ── Analytics Routes (lazy loaded) ── */}
        <Route path="analytics/predictive" element={<PermissionRoute perm="analytics.financial"><Suspense fallback={<PageLoader />}><PredictiveAnalytics /></Suspense></PermissionRoute>} />
        <Route path="analytics/financial" element={<PermissionRoute perm="analytics.financial"><Suspense fallback={<PageLoader />}><FinancialAnalytics /></Suspense></PermissionRoute>} />
        <Route path="analytics/loads" element={<PermissionRoute perm="analytics.operational"><Suspense fallback={<PageLoader />}><LoadAnalytics /></Suspense></PermissionRoute>} />
        <Route path="analytics/drivers" element={<PermissionRoute perm="analytics.operational"><Suspense fallback={<PageLoader />}><DriverAnalytics /></Suspense></PermissionRoute>} />
        <Route path="analytics/trips" element={<PermissionRoute perm="analytics.operational"><Suspense fallback={<PageLoader />}><TripAnalytics /></Suspense></PermissionRoute>} />
        <Route path="analytics/payments-analytics" element={<PermissionRoute perm="analytics.financial"><Suspense fallback={<PageLoader />}><PaymentAnalyticsPage /></Suspense></PermissionRoute>} />
        <Route path="analytics/operations" element={<PermissionRoute perm="analytics.operational"><Suspense fallback={<PageLoader />}><OperationalEfficiency /></Suspense></PermissionRoute>} />
        <Route path="analytics/routes" element={<PermissionRoute perm="analytics.operational"><Suspense fallback={<PageLoader />}><RouteAnalytics /></Suspense></PermissionRoute>} />

        {/* ── System Administration Routes ── */}
        <Route path="admin-users" element={<PermissionRoute perm="admin.manage"><Suspense fallback={<PageLoader />}><AdminManagement /></Suspense></PermissionRoute>} />
        <Route path="access-matrix" element={<PermissionRoute perm="access.matrix.edit"><Suspense fallback={<PageLoader />}><AccessMatrix /></Suspense></PermissionRoute>} />
        <Route path="audit-logs" element={<PermissionRoute perm="audit.view"><Suspense fallback={<PageLoader />}><AuditLogs /></Suspense></PermissionRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function MainApp() {
  const { isDarkMode } = useTheme();
  return (
    <ConfigProvider theme={isDarkMode ? luxuryGoldDarkTheme : luxuryGoldTheme}>
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

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
