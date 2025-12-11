import { Link } from 'react-router-dom';
import './HomePage.css';
import ThreeCanvas from '../../components/ThreeCanvas.jsx';

export default function HomePage() {
  return (
    <main className="app">
      <ThreeCanvas />
      <div className="study-launcher">
        <div className="launcher-card">
          <p className="launcher-eyebrow">Word Practice Zone</p>
          <h2>어휘 연습서 바로가기</h2>
          <p className="launcher-copy">기존 단어장과 새 파란 책을 원하는 스타일로 열람하세요.</p>
          <div className="launcher-actions">
            <Link className="launch-button ghost" to="/word-study">
              Word Study (기존)
            </Link>
            <Link className="launch-button primary" to="/lexicon-lab">
              Blue Lexicon Lab
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
