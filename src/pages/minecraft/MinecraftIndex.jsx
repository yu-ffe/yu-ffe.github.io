import { Link } from 'react-router-dom';
import '../games/Games.css';
import { minecraftPages } from './minecraftData.js';

export default function MinecraftIndex() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Minecraft Assignment</p>
          <h1>Minecraft Docs</h1>
          <p className="subtitle">플러그인·모드·저널 서브페이지를 React 라우터로 정리했습니다.</p>
        </div>
        <Link className="ghost" to="/">
          3D 방으로 돌아가기
        </Link>
      </header>

      <div className="card-grid">
        {minecraftPages.map((page) => (
          <Link key={page.slug} className="card" to={`/minecraft/${page.slug}`}>
            <div className="card-body">
              <p className="card-eyebrow">{page.slug}</p>
              <h2 className="card-title">{page.title}</h2>
              <p className="card-text">{page.description}</p>
            </div>
            <span className="card-link">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
