// Stream_LiveGame :: 애플리케이션 전역 스타일을 불러온다.
import './App.css';
// Stream_LiveGame :: Three.js 경험을 렌더링하는 캔버스 컴포넌트.
import ThreeCanvas from './components/ThreeCanvas.jsx';
import WordStudyPage from './components/WordStudyPage.jsx';
import { useEffect, useState } from 'react';

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = (event) => {
      const anchor = event.target?.closest?.('a[data-spa-link="true"]');
      if (anchor && anchor.href.startsWith(window.location.origin)) {
        event.preventDefault();
        const href = new URL(anchor.href);
        window.history.pushState({}, '', href.pathname);
        setPath(href.pathname);
      }
    };

    const handlePop = () => setPath(window.location.pathname);

    window.addEventListener('click', handleNavigation);
    window.addEventListener('popstate', handlePop);

    return () => {
      window.removeEventListener('click', handleNavigation);
      window.removeEventListener('popstate', handlePop);
    };
  }, []);

  if (path.startsWith('/study')) {
    return (
      <WordStudyPage
        onNavigateHome={() => {
          window.history.pushState({}, '', '/');
          setPath('/');
        }}
      />
    );
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
