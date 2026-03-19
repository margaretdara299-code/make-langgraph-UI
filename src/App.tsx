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
import { ROUTES } from '@/routes';

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.SKILLS_LIBRARY} replace />} />
            <Route path={ROUTES.SKILLS_LIBRARY} element={<SkillsLibraryPage />} />
            <Route path={ROUTES.SKILL_DESIGNER} element={<SkillDesignerPage />} />
            <Route path={ROUTES.ACTION_CATALOG} element={<ActionCatalogPage />} />
            <Route path={ROUTES.CONNECTORS} element={<ConnectorsPage />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
