// Stream_LiveGame :: 애플리케이션 전역 스타일을 불러온다.
import './App.css';
import ThreeCanvas from './components/ThreeCanvas.jsx';
import StudyPage from './components/StudyPage.jsx';

function App() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isStudyPage = pathname.includes('/study');

  if (isStudyPage) {
    return <StudyPage />;
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
