// Stream_LiveGame :: 애플리케이션 전역 스타일을 불러온다.
import './App.css';
// Stream_LiveGame :: Three.js 경험을 렌더링하는 캔버스 컴포넌트.
import ThreeCanvas from './components/ThreeCanvas.jsx';
import WordStudy from './WordStudy.jsx';
import LexiconLab from './LexiconLab.jsx';

function isWordStudyPage() {
  if (typeof window === 'undefined') {
    return false;
  }

  const { pathname, search, hash } = window.location;
  const params = new URLSearchParams(search);
  return (
    pathname.includes('word-study') ||
    params.get('page') === 'word-study' ||
    hash.includes('word-study')
  );
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
