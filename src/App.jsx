import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/home/HomePage.jsx';
import WordStudy from './pages/word-study/WordStudy.jsx';
import LexiconLab from './pages/lexicon-lab/LexiconLab.jsx';
import GamesIndex from './pages/games/GamesIndex.jsx';
import GamePage from './pages/games/GamePage.jsx';
import MinecraftIndex from './pages/minecraft/MinecraftIndex.jsx';
import MinecraftPage from './pages/minecraft/MinecraftPage.jsx';

function LegacyRedirect() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const pageParam = params.get('page');
  const hash = location.hash?.toLowerCase() ?? '';
  const onHome = location.pathname === '/' || location.pathname === '/index.html';

  if (onHome && (pageParam === 'word-study' || hash.includes('word-study'))) {
    return <Navigate to="/word-study" replace />;
  }

  if (onHome && (pageParam === 'lexicon-lab' || hash.includes('lexicon'))) {
    return <Navigate to="/lexicon-lab" replace />;
  }

  return null;
}

export default function App() {
  return (
    <>
      <LegacyRedirect />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/word-study" element={<WordStudy />} />
        <Route path="/lexicon-lab" element={<LexiconLab />} />
        <Route path="/games" element={<GamesIndex />} />
        <Route path="/games/:slug" element={<GamePage />} />
        <Route path="/minecraft" element={<MinecraftIndex />} />
        <Route path="/minecraft/:slug" element={<MinecraftPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
