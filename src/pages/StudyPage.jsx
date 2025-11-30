import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import './StudyPage.css';

const CSV_FILES = Array.from({ length: 12 }, (_, index) =>
  `/assets/words/${String(index + 1).padStart(2, '0')}.csv`
);

const USAGE_FIELDS = [
  '어원·역사적 변천',
  '의미 확장(현재 쓰임 포함)',
  '뉘앙스·레지스터',
  '문법적 특징',
  '자동사/타동사',
  '가산/불가산',
  '전치사 패턴',
  '필수 보어 등',
];

const FORM_FIELDS = [
  '형태론적 분석(접두사·어근·접미사)',
  '파생어·관련어',
  '혼동 주의 단어',
];

const SEMANTIC_FIELDS = ['동의어·유사어', '반의어', '콜로케이션(뜻 포함)'];

const PRACTICE_FIELDS = [
  '예문(난이도별 2~3개)',
  '학습 팁',
  '교과/분야 태그',
  '빈도 정도(고/중/저)',
  '단어 난이도(1~10)',
  'OX 체크용 문항(기본값 X)',
  '미니 퀴즈(3문항 선택형)',
];

function normalize(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function StudyPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function loadCsvFiles() {
      try {
        const datasets = await Promise.all(
          CSV_FILES.map(async (filePath, index) => {
            const response = await fetch(filePath, { cache: 'no-cache' });
            if (!response.ok) {
              throw new Error(`${filePath} 응답 오류 (${response.status})`);
            }

            const rawText = await response.text();
            const cleaned = rawText.replace(/^\ufeff/, '');
            const { data } = Papa.parse(cleaned, { header: true, skipEmptyLines: true });

            return data.map((row) => ({
              ...row,
              __unit: index + 1,
              __key: `${index + 1}-${normalize(row['단어']) || Math.random().toString(36)}`,
            }));
          })
        );

        if (isMounted) {
          setEntries(datasets.flat());
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || '데이터를 불러오는 중 문제가 발생했습니다.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCsvFiles();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredEntries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesUnit = unitFilter === 'all' || entry.__unit === Number(unitFilter);
      if (!matchesUnit) return false;

      if (!term) return true;

      const haystack = [
        normalize(entry['단어']),
        normalize(entry['주요 의미(핵심 뜻)']),
        normalize(entry['핵심 개념 요약(한 문장)']),
        normalize(entry['예문(난이도별 2~3개)']),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [entries, searchTerm, unitFilter]);

  const toggleCard = (key) => {
    setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderFieldGroup = (entry, fields) => (
    <div className="info-grid">
      {fields.map((field) => (
        <div className="info-item" key={field}>
          <p className="label">{field}</p>
          <p className="value">{normalize(entry[field]) || '—'}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="study-page">
      <header className="study-header">
        <div className="header-row">
          <div>
            <p className="eyebrow">WORDS TRAINER</p>
            <h1>학습 서재</h1>
            <p className="subtitle">12개의 CSV 세트에서 어휘 정보를 한눈에 살펴보세요.</p>
          </div>
          <a className="back-button" href="/">
            3D 공간으로 돌아가기
          </a>
        </div>

        <div className="meta-panel">
          <div className="meta-pill">세트 수: 12</div>
          <div className="meta-pill">총 단어: {entries.length.toLocaleString()}</div>
          <div className="meta-pill subtle">모바일 최적화 · 접이식 상세 정보</div>
        </div>

        <div className="filters">
          <div className="filter">
            <label htmlFor="search">검색</label>
            <input
              id="search"
              type="search"
              placeholder="단어, 핵심 뜻, 예문 키워드로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter">
            <label htmlFor="unit">세트</label>
            <select
              id="unit"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
            >
              <option value="all">전체</option>
              {CSV_FILES.map((_, idx) => (
                <option key={idx} value={idx + 1}>
                  {String(idx + 1).padStart(2, '0')} 세트
                </option>
              ))}
            </select>
          </div>
          <div className="filter helper">
            <p className="helper-title">Tip</p>
            <p className="helper-text">핵심 정보는 항상 펼쳐지고, 확장 정보는 카드별로 접을 수 있습니다.</p>
          </div>
        </div>
      </header>

      <main className="word-list" aria-live="polite">
        {loading && <p className="status">데이터를 불러오는 중입니다...</p>}
        {error && !loading && <p className="status error">{error}</p>}

        {!loading && !error && filteredEntries.length === 0 && (
          <p className="status">조건에 맞는 단어가 없습니다.</p>
        )}

        {filteredEntries.map((entry) => {
          const isExpanded = expandedCards[entry.__key];
          return (
            <article className="word-card" key={entry.__key}>
              <div className="card-head">
                <div className="title-block">
                  <div className="unit-pill">세트 {String(entry.__unit).padStart(2, '0')}</div>
                  <h2>{normalize(entry['단어'])}</h2>
                  <p className="pos">{normalize(entry['품사'])}</p>
                </div>
                <div className="headline-meaning">
                  <p className="label">주요 의미</p>
                  <p className="value main-meaning">{normalize(entry['주요 의미(핵심 뜻)'])}</p>
                  <p className="label">핵심 개념 요약</p>
                  <p className="value concept">{normalize(entry['핵심 개념 요약(한 문장)'])}</p>
                </div>
                <button className="toggle" type="button" onClick={() => toggleCard(entry.__key)}>
                  {isExpanded ? '상세 접기' : '상세 펼치기'}
                </button>
              </div>

              <section className="section">
                <div className="section-title">사용 맥락</div>
                {renderFieldGroup(entry, USAGE_FIELDS)}
              </section>

              <section className={`section collapsible ${isExpanded ? 'open' : ''}`}>
                <div className="section-title">형태 · 관련어 · 의미망</div>
                {renderFieldGroup(entry, [...FORM_FIELDS, ...SEMANTIC_FIELDS])}
              </section>

              <section className={`section collapsible ${isExpanded ? 'open' : ''}`}>
                <div className="section-title">연습 · 평가</div>
                {renderFieldGroup(entry, PRACTICE_FIELDS)}
              </section>
            </article>
          );
        })}
      </main>
    </div>
  );
}

export default StudyPage;
