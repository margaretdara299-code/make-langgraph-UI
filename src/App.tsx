/**
 * Root App component with AntD ConfigProvider and routing.
 * Login page renders outside MainLayout.
 * All other routes are protected by PrivateRoute.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { antdTheme, darkTheme } from '@/config';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import MainLayout from '@/layouts/MainLayout/MainLayout';
import SkillsLibraryPage from '@/pages/SkillsLibrary/SkillsLibraryPage';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import SkillDesignerPage from '@/pages/SkillDesigner/SkillDesignerPage';
import ActionCatalogPage from '@/pages/ActionCatalog/ActionCatalogPage';
import ConnectorsPage from '@/pages/Connectors/ConnectorsPage';
import CapabilitiesPage from '@/pages/Capabilities/CapabilitiesPage';
import CategoriesPage from '@/pages/Categories/CategoriesPage';
import LoginPage from '@/pages/Login/LoginPage';
import PrivateRoute from '@/components/PrivateRoute/PrivateRoute';
import PublicRoute from '@/components/PublicRoute/PublicRoute';
import { ROUTES } from '@/routes';
import AppInitializer from '@/components/AppInitializer/AppInitializer';

function AppContent() {
  const { isDark } = useTheme();

  const basename = import.meta.env.VITE_BASE_URL || '/';

  return (
    <ConfigProvider theme={isDark ? darkTheme : antdTheme}>
      <AppInitializer>
        <BrowserRouter basename={basename}>
          <Routes>
            {/* Public route — login (redirects to dashboard if already authenticated) */}
            <Route
              path={ROUTES.LOGIN}
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Protected routes — wrapped in PrivateRoute + MainLayout */}
            <Route
              path="*"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Routes>
                      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                      <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                      <Route path={ROUTES.SKILLS_LIBRARY} element={<SkillsLibraryPage />} />
                      <Route path={ROUTES.SKILL_DESIGNER} element={<SkillDesignerPage />} />
                      <Route path={ROUTES.ACTION_CATALOG} element={<ActionCatalogPage />} />
                      <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
                      <Route path={ROUTES.CONNECTORS} element={<ConnectorsPage />} />
                      <Route path={ROUTES.CAPABILITIES} element={<CapabilitiesPage />} />
                      <Route path={ROUTES.TOOLS} element={<div>Tools Placeholder</div>} />
                      <Route path={ROUTES.WORKFLOW} element={<div>Workflow Placeholder</div>} />
                      {/* Catch-all: redirect unknown routes to dashboard */}
                      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                    </Routes>
                  </MainLayout>
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AppInitializer>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
