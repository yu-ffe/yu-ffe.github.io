import './LexiconLab.css';
import './TransferHub.css';
import { hrefToTransferPage } from './transferNav.js';

const LINKS = [
  {
    key: 'wordStudy',
    title: '편입 단어',
    desc: '단어 전용 · CSV 단어 카드 학습',
    pageKey: 'wordStudy',
  },
  {
    key: 'mathLab',
    title: '편입 수학',
    desc: 'Math Lab · 미분 공식 퀴즈',
    pageKey: 'mathLab',
  },
];

export default function TransferHub() {
  return (
    <div className="lex-page transfer-hub-page">
      <header className="lex-topbar">
        <div className="topbar-title">
          <p className="eyebrow">Transfer</p>
          <h1>편입 학습 허브</h1>
          <p className="subtitle">단어 · 수학 화면으로 이동했다가, 언제든 여기로 돌아올 수 있습니다.</p>
        </div>
      </header>

      <ul className="transfer-hub-grid" role="list">
        {LINKS.map((item) => (
          <li key={item.key}>
            <a className="transfer-hub-card" href={hrefToTransferPage(item.pageKey)}>
              <span className="transfer-hub-card-title">{item.title}</span>
              <span className="transfer-hub-card-desc">{item.desc}</span>
              <span className="transfer-hub-card-cta">이동 →</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
