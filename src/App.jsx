// Stream_LiveGame :: 애플리케이션 전역 스타일을 불러온다.
import './App.css';
// Stream_LiveGame :: Three.js 경험을 렌더링하는 캔버스 컴포넌트.
import ThreeCanvas from './components/ThreeCanvas.jsx';
import WordsPage from './pages/WordsPage.jsx';

function App() {
  const wordStudyPath = `${import.meta.env.BASE_URL ?? '/'}words`;
  const isWordStudyPage = window.location.pathname.startsWith(wordStudyPath);

  // Stream_LiveGame :: 단일 캔버스로 구성된 메인 레이아웃을 반환한다.
  return (
    <main className={`app ${isWordStudyPage ? 'word-app' : ''}`}>
      {isWordStudyPage ? (
        <WordsPage />
      ) : (
        <ThreeCanvas />
      )}
    </main>
  );
}

// Stream_LiveGame :: 외부에서 App 컴포넌트를 사용할 수 있도록 기본 내보내기.
export default App;
