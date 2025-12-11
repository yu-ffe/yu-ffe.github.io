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


function isLexiconLabPage() {
  if (typeof window === 'undefined') {
    return false;
  }

  const { pathname, search, hash } = window.location;
  const params = new URLSearchParams(search);
  return pathname.includes('lexicon') || params.get('page') === 'lexicon-lab' || hash.includes('lexicon');
}

function App() {
  if (isLexiconLabPage()) {
    return <LexiconLab />;
  }

  if (isWordStudyPage()) {
    return <WordStudy />;
  }

  // Stream_LiveGame :: 단일 캔버스로 구성된 메인 레이아웃을 반환한다.
  return (
    <main className="app">
      {/* Stream_LiveGame :: 3D 씬을 그리는 캔버스를 포함한다. */}
      <ThreeCanvas />
    </main>
  );
}

// Stream_LiveGame :: 외부에서 App 컴포넌트를 사용할 수 있도록 기본 내보내기.
export default App;