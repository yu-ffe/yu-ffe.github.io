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
      <div className="study-launcher">
        <div className="launcher-card">
          <p className="launcher-eyebrow">Word Practice Zone</p>
          <h2>어휘 연습서 바로가기</h2>
          <p className="launcher-copy">기존 단어장과 새 파란 책을 원하는 스타일로 열람하세요.</p>
          <div className="launcher-actions">
            <a className="launch-button ghost" href="?page=word-study">
              Word Study (기존)
            </a>
            <a className="launch-button primary" href="?page=lexicon-lab">
              Blue Lexicon Lab
            </a>
          </div>
        </div>

        <div className="launcher-card">
          <p className="launcher-eyebrow">Minecraft Assignment</p>
          <h2>Minecraft Mod &amp; Plugin</h2>
          <p className="launcher-copy">이미 준비된 모드/플러그인 제출 페이지를 바로 확인하세요.</p>
          <div className="launcher-actions">
            <a className="launch-button primary" href="/minecraft_ass1/minecraft_mod.html">
              Mod 페이지
            </a>
            <a className="launch-button ghost" href="/minecraft_ass1/minecraft_plugin.html">
              Plugin 페이지
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

// Stream_LiveGame :: 외부에서 App 컴포넌트를 사용할 수 있도록 기본 내보내기.
export default App;
