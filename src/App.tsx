import { Route, Routes, useLocation } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import TabBar from './components/TabBar';
import ListPage from './pages/ListPage';
import PaperPage from './pages/PaperPage';
import SchedulePage from './pages/SchedulePage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { pathname } = useLocation();
  const isDetail = pathname.startsWith('/paper/');

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main
        className={`mx-auto w-full max-w-[640px] ${
          isDetail
            ? 'pb-[calc(env(safe-area-inset-bottom)+16px)]'
            : 'pb-[calc(52px+env(safe-area-inset-bottom)+8px)]'
        }`}
      >
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/paper/:id" element={<PaperPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      {!isDetail && <TabBar />}
    </div>
  );
}
