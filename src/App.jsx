// Stream_LiveGame :: 애플리케이션 전역 스타일을 불러온다.
import { useEffect, useState } from 'react';
import './App.css';
// Stream_LiveGame :: Three.js 경험을 렌더링하는 캔버스 컴포넌트.
import ThreeCanvas from './components/ThreeCanvas.jsx';
import StudyPage from './pages/StudyPage.jsx';

function App() {
  // 라우팅 라이브러리 없이 경로 기반으로 화면을 전환한다.
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isStudyPage = pathname.includes('/study');

  // Stream_LiveGame :: 단일 캔버스로 구성된 메인 레이아웃 또는 학습 페이지를 반환한다.
  return isStudyPage ? (
    <StudyPage />
  ) : (
    <main className="app">
      {/* Stream_LiveGame :: 3D 씬을 그리는 캔버스를 포함한다. */}
      <ThreeCanvas />
    </main>
  );
}

// Stream_LiveGame :: 외부에서 App 컴포넌트를 사용할 수 있도록 기본 내보내기.
export default App;
