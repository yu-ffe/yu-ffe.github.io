import { Link, useParams } from 'react-router-dom';
import './Games.css';
import { games } from './gameData.js';

export default function GamePage() {
  const { slug } = useParams();
  const game = games.find((item) => item.slug === slug);

  if (!game) {
    return (
      <div className="page-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">Three.js Mini Games</p>
            <h1>게임을 찾을 수 없습니다.</h1>
            <p className="subtitle">경로를 확인하거나 목록으로 이동하세요.</p>
          </div>
          <Link className="ghost" to="/games">
            목록으로 돌아가기
          </Link>
        </header>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Three.js Mini Games</p>
          <h1>{game.title}</h1>
          <p className="subtitle">{game.description}</p>
        </div>
        <div className="header-actions">
          <Link className="ghost" to="/games">
            다른 게임 보기
          </Link>
          <Link className="ghost" to="/">
            3D 방으로 돌아가기
          </Link>
        </div>
      </header>

      <div className="iframe-wrapper">
        <iframe
          title={game.title}
          src={game.src}
          className="iframe-embed"
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
