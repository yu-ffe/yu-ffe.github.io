import { Link } from 'react-router-dom';
import './Games.css';
import { games } from './gameData.js';

export default function GamesIndex() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Three.js Mini Games</p>
          <h1>Game Collection</h1>
          <p className="subtitle">React 라우터에서 바로 실행되는 미니 게임 모음집입니다.</p>
        </div>
        <Link className="ghost" to="/">
          3D 방으로 돌아가기
        </Link>
      </header>

      <div className="card-grid">
        {games.map((game) => (
          <Link key={game.slug} className="card" to={`/games/${game.slug}`}>
            <div className="card-body">
              <p className="card-eyebrow">{game.slug}</p>
              <h2 className="card-title">{game.title}</h2>
              <p className="card-text">{game.description}</p>
            </div>
            <span className="card-link">Play →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
