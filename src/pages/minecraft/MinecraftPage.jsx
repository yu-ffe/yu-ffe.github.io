import { Link, useParams } from 'react-router-dom';
import '../games/Games.css';
import { minecraftPages } from './minecraftData.js';

export default function MinecraftPage() {
  const { slug } = useParams();
  const page = minecraftPages.find((item) => item.slug === slug);

  if (!page) {
    return (
      <div className="page-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">Minecraft Assignment</p>
            <h1>페이지를 찾을 수 없습니다.</h1>
            <p className="subtitle">주소를 확인하거나 목록으로 이동하세요.</p>
          </div>
          <Link className="ghost" to="/minecraft">
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
          <p className="eyebrow">Minecraft Assignment</p>
          <h1>{page.title}</h1>
          <p className="subtitle">{page.description}</p>
        </div>
        <div className="header-actions">
          <Link className="ghost" to="/minecraft">
            다른 문서 보기
          </Link>
          <Link className="ghost" to="/">
            3D 방으로 돌아가기
          </Link>
        </div>
      </header>

      <div className="iframe-wrapper">
        <iframe
          title={page.title}
          src={page.src}
          className="iframe-embed"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
