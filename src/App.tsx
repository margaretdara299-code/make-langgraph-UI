/**
 * Root App component.
 * Wraps pages in the MainLayout and shows the Skills Library as landing page.
 */

import MainLayout from '@/layouts/MainLayout/MainLayout';
import SkillsLibraryPage from '@/pages/SkillsLibrary/SkillsLibraryPage';

function App() {
  return (
    <MainLayout>
      <SkillsLibraryPage />
    </MainLayout>
  );
}

export default App;
