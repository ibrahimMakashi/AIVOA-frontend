import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import { selectIsAuthenticated } from './features/auth/authSlice';
import AppLayout from './components/layout/AppLayout';

// Lazy-load all pages for code splitting and faster initial load
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const HCPListPage = lazy(() => import('./features/hcp/HCPListPage'));
const InteractionHistoryPage = lazy(() => import('./features/interactions/InteractionHistoryPage'));
const LogInteractionPage = lazy(() => import('./features/ai/LogInteractionPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300 }}>
    <CircularProgress size={32} />
  </Box>
);

/**
 * RequireAuth — protects routes by redirecting to /login if not authenticated.
 * Preserves the intended URL so the user is redirected back after login.
 */
const RequireAuth = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected — wrapped in AppLayout */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="/hcps"
          element={
            <Suspense fallback={<PageLoader />}>
              <HCPListPage />
            </Suspense>
          }
        />
        <Route
          path="/interactions"
          element={
            <Suspense fallback={<PageLoader />}>
              <InteractionHistoryPage />
            </Suspense>
          }
        />
        <Route
          path="/log-interaction"
          element={
            <Suspense fallback={<PageLoader />}>
              <LogInteractionPage />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  </Suspense>
);

export default App;
