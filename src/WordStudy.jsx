import { useEffect, useMemo, useState } from 'react';
import './WordStudy.css';

const CSV_COUNT = 92;

const CSV_FILES = Array.from({ length: CSV_COUNT }, (_, index) =>
  `/assets/words/${String(index + 1).padStart(2, '0')}.csv`
);

const CSV_HEADERS = [
  '단어',
  '품사',
  '주요 의미(핵심 뜻)',
  '핵심 개념 요약(한 문장)',
  '어원·역사적 변천',
  '의미 확장(현재 쓰임 포함)',
  '뉘앙스·레지스터',
  '문법적 특징',
  '자동사/타동사',
  '가산/불가산',
  '전치사 패턴',
  '필수 보어 등',
  '형태론적 분석(접두사·어근·접미사)',
  '파생어·관련어',
  '혼동 주의 단어',
  '동의어·유사어',
  '반의어',
  '콜로케이션(뜻 포함)',
  '예문(난이도별 2~3개)',
  '학습 팁',
  '교과/분야 태그',
  '빈도 정도(고/중/저)',
  '단어 난이도(1~10)',
  'OX 체크용 문항(기본값 X)',
  '미니 퀴즈(3문항 선택형)',
];

const SECTION_GROUPS = [
  {
    key: 'core',
    title: '섹션 1. 핵심 의미 · 예문',
    fields: [
      { label: '단어', key: '단어' },
      { label: '주요 의미', key: '주요 의미(핵심 뜻)' },
      { label: '핵심 개념 요약', key: '핵심 개념 요약(한 문장)' },
      { label: '형태·분석(접두/어근/접미)', key: '형태론적 분석(접두사·어근·접미사)' },
      { label: '파생어·관련어', key: '파생어·관련어' },
      { label: '어원·역사적 변천', key: '어원·역사적 변천' },
      { label: '의미 확장', key: '의미 확장(현재 쓰임 포함)' },
      { label: '전치사 패턴', key: '전치사 패턴' },
      { label: '필수 보어', key: '필수 보어 등' },
      { label: '혼동 주의 단어', key: '혼동 주의 단어' },
      { label: '동의어·유사어', key: '동의어·유사어' },
      { label: '반의어', key: '반의어' },
      { label: '콜로케이션', key: '콜로케이션(뜻 포함)' },
      { label: '예문(난이도별 2~3개)', key: '예문(난이도별 2~3개)' },
      { label: '학습 팁', key: '학습 팁' },
    ],
  },
  {
    key: 'nuance',
    title: '섹션 2. 뉘앙스 · 문법 · 퀴즈',
    fields: [
      { label: '뉘앙스·레지스터', key: '뉘앙스·레지스터' },
      { label: '문법적 특징', key: '문법적 특징' },
      { label: '자동사/타동사', key: '자동사/타동사' },
      { label: '가산/불가산', key: '가산/불가산' },
      { label: '미니 퀴즈(3문항 선택형)', key: '미니 퀴즈(3문항 선택형)' },
    ],
  },
  {
    key: 'meta',
    title: '섹션 3. 품사 · 태그 · 난이도',
    fields: [
      { label: '품사', key: '품사' },
      { label: '교과/분야 태그', key: '교과/분야 태그' },
      { label: '빈도 정도(고/중/저)', key: '빈도 정도(고/중/저)' },
      { label: '단어 난이도(1~10)', key: '단어 난이도(1~10)' },
      { label: 'OX 체크용 문항(기본값 X)', key: 'OX 체크용 문항(기본값 X)' },
    ],
  },
];

function parseCsv(text) {
  const rows = [];
  let currentField = '';
  let currentRow = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentField += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
      if (char === '\r' && next === '\n') {
        i += 1;
      }
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0];
  return rows
    .slice(1)
    .filter((row) => row.some((cell) => cell && cell.trim().length > 0))
    .map((row) => {
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = row[index]?.trim() ?? '';
      });
      return entry;
    });
}

function formatValue(value) {
  if (!value) return '—';
  return value
    .split(/(?<=\.)\s+(?=[A-Z]|\d)/)
    .join(' ')
    .replace(/\\n/g, ' ');
}

function StudyField({ label, value }) {
  return (
    <div className="study-field" key={label}>
      <p className="field-label">{label}</p>
      <p className="field-value">{formatValue(value)}</p>
    </div>
  );
}

function WordCard({ entry }) {
  const [collapsedGroups, setCollapsedGroups] = useState(() =>
    Object.fromEntries(SECTION_GROUPS.map((group) => [group.key, true]))
  );

  const toggleGroup = (key) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <article className="study-card">
      <div className="card-header">
        <div>
          <p className="word-label">{entry['단어']}</p>
          <p className="pos-label">{entry['품사']}</p>
          <p className="card-note">아래 토글을 열어 상세 필드를 확인하세요.</p>
        </div>
        <div className="badges">
          <span className="badge badge-ghost">{entry.sourceLabel}</span>
          <span className="badge badge-tone">{entry['빈도 정도(고/중/저)'] || '빈도 미정'}</span>
          <span className="badge badge-level">Lv. {entry['단어 난이도(1~10)'] || '—'}</span>
        </div>
      </div>

      {SECTION_GROUPS.map((group) => (
        <section key={group.key} className="collapsible">
          <button className="collapse-trigger" type="button" onClick={() => toggleGroup(group.key)}>
            <div className="collapse-labels">
              <span className="collapse-title">{group.title}</span>
              <span className="collapse-sub">필드 집합을 열어 세부 정보를 확인하세요.</span>
            </div>
            <span className="chevron">{collapsedGroups[group.key] ? '▼' : '▲'}</span>
          </button>
          <div className={`collapse-content ${collapsedGroups[group.key] ? 'collapsed' : ''}`}>
            {group.fields.map((field) => (
              <StudyField key={field.key} label={field.label} value={entry[field.key]} />
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}

export default function WordStudy() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [pageIndex, setPageIndex] = useState(0);
  const [cardPage, setCardPage] = useState(1);

  useEffect(() => {
    async function fetchAll() {
      try {
        const results = await Promise.allSettled(
          CSV_FILES.map(async (file, fileIndex) => {
            const res = await fetch(file, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`Failed to load ${file}`);
            const text = await res.text();
            const parsed = parseCsv(text);
            return parsed.map((item) => ({
              ...item,
              source: file,
              sourceIndex: fileIndex,
              sourceLabel: file.split('/').pop()?.replace('.csv', '').padStart(2, '0') ?? '자료',
            }));
          })
        );

        const fulfilled = results.flatMap((result, index) => {
          if (result.status === 'fulfilled') return result.value;
          console.warn(
            `단어장 ${String(index + 1).padStart(2, '0')}을 불러오지 못했습니다.`,
            result.reason
          );
          return [];
        });

        if (fulfilled.length === 0) {
          setError('단어장을 불러오지 못했습니다.');
        } else {
          setEntries(fulfilled);
        }
      } catch (err) {
        setError(err.message ?? '단어장을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  useEffect(() => {
    setCardPage(1);
  }, [difficulty, pageIndex, query]);

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        CSV_HEADERS.some((header) => (entry[header] ?? '').toLowerCase().includes(q));

      const level = Number(entry['단어 난이도(1~10)']);
      const matchesDifficulty =
        difficulty === 'all' ||
        (difficulty === '1' && level >= 1 && level <= 3) ||
        (difficulty === '4' && level >= 4 && level <= 6) ||
        (difficulty === '7' && level >= 7);

      return matchesQuery && matchesDifficulty;
    });
  }, [difficulty, entries, query]);

  const cardsPerPage = 6;
  const filteredByPage = useMemo(
    () => filtered.filter((entry) => entry.sourceIndex === pageIndex),
    [filtered, pageIndex]
  );

  const totalCardPages = Math.max(1, Math.ceil(filteredByPage.length / cardsPerPage));
  const safeCardPage = Math.min(cardPage, totalCardPages);
  const start = (safeCardPage - 1) * cardsPerPage;
  const visibleEntries = filteredByPage.slice(start, start + cardsPerPage);

  return (
    <div className="word-study-layout">
      <header className="study-topbar">
        <div>
          <p className="eyebrow">모바일 최적화 / 전 필드 포함</p>
          <h1>Word Study Lab</h1>
          <p className="subtitle">모든 단어장을 한 번에 모아 빠르게 복습하세요.</p>
        </div>
        <a className="back-link" href="/">3D 방으로 돌아가기</a>
      </header>

      <section className="controls">
        <div className="control-group">
          <label htmlFor="search">검색</label>
          <input
            id="search"
            type="search"
            placeholder="단어, 의미, 예문 키워드로 찾기"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="control-group">
          <label htmlFor="difficulty">난이도</label>
          <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="all">전체</option>
            <option value="1">1-3</option>
            <option value="4">4-6</option>
            <option value="7">7-10</option>
          </select>
        </div>
        <div className="control-group wide">
          <label>페이지</label>
          <div className="page-buttons" role="group" aria-label="자료 페이지 선택">
            {CSV_FILES.map((_, index) => {
              const label = String(index + 1).padStart(2, '0');
              const active = index === pageIndex;
              return (
                <button
                  key={label}
                  type="button"
                  className={`page-button ${active ? 'active' : ''}`}
                  onClick={() => setPageIndex(index)}
                  aria-pressed={active}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="control-note">01부터 {String(CSV_FILES.length).padStart(2, '0')}까지 넘겨 보세요.</p>
        </div>
        <div className="control-hint">
          중요도가 낮은 파트는 접어서, 자주 보는 핵심만 펼쳐두세요.
        </div>
      </section>

      {loading && <p className="status">데이터를 불러오는 중입니다...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <section className="card-stack">
          {visibleEntries.map((entry, index) => (
            <WordCard key={`${entry['단어']}-${index}`} entry={entry} />
          ))}
          {filteredByPage.length === 0 && <p className="status">조건에 맞는 단어가 없습니다.</p>}
          {filteredByPage.length > 0 && (
            <div className="pagination">
              <button
                type="button"
                className="pager"
                onClick={() => setCardPage((prev) => Math.max(1, prev - 1))}
                disabled={safeCardPage === 1}
              >
                이전
              </button>
              <span className="page-status">
                {String(safeCardPage).padStart(2, '0')} / {String(totalCardPages).padStart(2, '0')}
              </span>
              <button
                type="button"
                className="pager"
                onClick={() => setCardPage((prev) => Math.min(totalCardPages, prev + 1))}
                disabled={safeCardPage === totalCardPages}
              >
                다음
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
