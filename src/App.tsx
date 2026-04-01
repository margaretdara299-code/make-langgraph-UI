/**
 * Root App component with AntD ConfigProvider and routing.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { antdTheme } from '@/config';
import MainLayout from '@/layouts/MainLayout/MainLayout';
import SkillsLibraryPage from '@/pages/SkillsLibrary/SkillsLibraryPage';
import SkillDesignerPage from '@/pages/SkillDesigner/SkillDesignerPage';
import ActionCatalogPage from '@/pages/ActionCatalog/ActionCatalogPage';
import ConnectorsPage from '@/pages/Connectors/ConnectorsPage';
import CategoriesPage from '@/pages/Categories/CategoriesPage';
import CapabilitiesPage from '@/pages/Capabilities/CapabilitiesPage';
import { ROUTES } from '@/routes';
import AppInitializer from '@/components/AppInitializer/AppInitializer';

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <AppInitializer>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              <Route path={ROUTES.DASHBOARD} element={<div>Dashboard Placeholder</div>} />
              <Route path={ROUTES.SKILLS_LIBRARY} element={<SkillsLibraryPage />} />
              <Route path={ROUTES.SKILL_DESIGNER} element={<SkillDesignerPage />} />
              <Route path={ROUTES.ACTION_CATALOG} element={<ActionCatalogPage />} />
              <Route path={ROUTES.CONNECTORS} element={<ConnectorsPage />} />
              <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
              <Route path={ROUTES.CAPABILITIES} element={<CapabilitiesPage />} />
              <Route path={ROUTES.TOOLS} element={<div>Tools Placeholder</div>} />
              <Route path={ROUTES.WORKFLOW} element={<div>Workflow Placeholder</div>} />

            </Routes>
          </MainLayout>
        </BrowserRouter>
      </AppInitializer>
    </ConfigProvider>
  );
}

export default App;
