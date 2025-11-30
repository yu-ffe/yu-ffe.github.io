import { useEffect, useMemo, useState } from 'react';
import './WordsPage.css';

const HEADERS = [
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

const MONTH_FILES = Array.from({ length: 12 }, (_, index) =>
  `${String(index + 1).padStart(2, '0')}.csv`
);

const STORAGE_KEY = 'word-study-preferences';

function parseCsv(text) {
  const clean = text.replace(/^\uFEFF/, '');
  const rows = [];
  const currentRow = [];
  let current = '';
  let insideQuotes = false;

  const pushCell = () => {
    currentRow.push(current.trim());
    current = '';
  };

  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i];
    const next = clean[i + 1];

    if (char === '"') {
      if (insideQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      pushCell();
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      pushCell();
      if (currentRow.length) {
        rows.push(currentRow.splice(0));
      }
    } else {
      current += char;
    }
  }

  if (current.length > 0 || currentRow.length > 0) {
    pushCell();
    if (currentRow.length) {
      rows.push(currentRow.splice(0));
    }
  }

  return rows.filter((row) => row.some((cell) => cell.trim().length > 0));
}

function csvToEntries(text, sourceLabel) {
  const rows = parseCsv(text);
  if (!rows.length) return [];

  const body = rows.slice(1);

  return body.map((cells, index) => {
    const record = HEADERS.reduce((acc, header, headerIndex) => {
      acc[header] = cells[headerIndex] ?? '';
      return acc;
    }, {});

    return {
      id: `${sourceLabel}-${index}-${record['단어'] || index}`,
      source: sourceLabel,
      ...record,
    };
  });
}

function useStudyData() {
  const baseUrl = useMemo(() => import.meta.env.BASE_URL ?? '/', []);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const results = await Promise.all(
          MONTH_FILES.map(async (file, index) => {
            const response = await fetch(`${baseUrl}assets/words/${file}`, { cache: 'no-cache' });
            if (!response.ok) {
              throw new Error(`파일을 불러오지 못했습니다: ${file}`);
            }
            const text = await response.text();
            return csvToEntries(text, `0${index + 1}`.slice(-2));
          })
        );
        if (mounted) {
          setEntries(results.flat());
        }
      } catch (error) {
        console.error(error);
        if (mounted) {
          setEntries([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [baseUrl]);

  return { entries, loading };
}

function loadPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('학습 설정을 불러오지 못했습니다:', error);
    return null;
  }
}

function savePreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('학습 설정을 저장하지 못했습니다:', error);
  }
}

function WordsPage() {
  const { entries, loading } = useStudyData();
  const baseUrl = useMemo(() => import.meta.env.BASE_URL ?? '/', []);
  const [query, setQuery] = useState('');
  const [month, setMonth] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [frequency, setFrequency] = useState('all');

  useEffect(() => {
    const prefs = loadPreferences();
    if (prefs) {
      setQuery(prefs.query ?? '');
      setMonth(prefs.month ?? 'all');
      setDifficulty(prefs.difficulty ?? 'all');
      setFrequency(prefs.frequency ?? 'all');
    }
  }, []);

  useEffect(() => {
    savePreferences({ query, month, difficulty, frequency });
  }, [query, month, difficulty, frequency]);

  const filtered = entries.filter((entry) => {
    const matchesQuery = query
      ? HEADERS.some((header) => entry[header]?.toLowerCase().includes(query.toLowerCase()))
      : true;

    const matchesMonth = month === 'all' || entry.source === month;

    const matchesDifficulty = difficulty === 'all'
      || Number(entry['단어 난이도(1~10)']) >= Number(difficulty);

    const matchesFrequency = frequency === 'all'
      || (entry['빈도 정도(고/중/저)'] ?? '').includes(frequency);

    return matchesQuery && matchesMonth && matchesDifficulty && matchesFrequency;
  });

  const monthBuckets = useMemo(() => {
    return filtered.reduce((acc, entry) => {
      acc[entry.source] = acc[entry.source] ?? [];
      acc[entry.source].push(entry);
      return acc;
    }, {});
  }, [filtered]);

  const stats = useMemo(() => {
    const total = entries.length;
    const mastered = entries.filter((entry) => Number(entry['단어 난이도(1~10)']) <= 4).length;
    return {
      total,
      mastered,
      inProgress: Math.max(0, total - mastered),
    };
  }, [entries]);

  return (
    <div className="word-page">
      <header className="word-hero">
        <div className="hero-meta">
          <p className="eyebrow">Vocabulary Workbook</p>
          <h1>
            12권 단어장 한눈에 보기
            <span className="hero-dot" aria-hidden>•</span>
            모바일 맞춤 학습
          </h1>
          <p className="subtext">
            01~12권 CSV의 모든 열을 빠짐없이 카드로 정리했습니다.
            검색 · 필터를 활용해 필요한 단어만 집중 학습하세요.
          </p>
          <div className="hero-actions">
            <a className="ghost" href={baseUrl}>메인으로 돌아가기</a>
            <span className="hero-progress">총 {stats.total} 단어 • 난이도 1~10</span>
          </div>
        </div>
        <div className="hero-stats" aria-label="학습 요약">
          <div className="stat">
            <span className="label">전체</span>
            <strong>{stats.total}</strong>
            <small>CSV에서 자동 집계</small>
          </div>
          <div className="stat">
            <span className="label">쉬운 단어</span>
            <strong>{stats.mastered}</strong>
            <small>난이도 1~4</small>
          </div>
          <div className="stat">
            <span className="label">도전</span>
            <strong>{stats.inProgress}</strong>
            <small>난이도 5~10</small>
          </div>
        </div>
      </header>

      <section className="filters" aria-label="필터">
        <div className="filter-control">
          <label htmlFor="query">검색</label>
          <input
            id="query"
            type="search"
            placeholder="단어, 뜻, 예문을 입력하세요"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="filter-row">
          <div className="filter-control">
            <label htmlFor="month">권 선택</label>
            <select id="month" value={month} onChange={(event) => setMonth(event.target.value)}>
              <option value="all">전체 (01~12)</option>
              {MONTH_FILES.map((file, index) => {
                const label = `0${index + 1}`.slice(-2);
                return (
                  <option key={file} value={label}>
                    {label}권
                  </option>
                );
              })}
            </select>
          </div>
          <div className="filter-control">
            <label htmlFor="difficulty">난이도</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              <option value="all">전체</option>
              <option value="3">3 이상</option>
              <option value="5">5 이상</option>
              <option value="7">7 이상</option>
              <option value="9">9 이상</option>
            </select>
          </div>
          <div className="filter-control">
            <label htmlFor="frequency">빈도</label>
            <select
              id="frequency"
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
            >
              <option value="all">전체</option>
              <option value="고">고</option>
              <option value="중">중</option>
              <option value="저">저</option>
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="loading">CSV를 불러오고 있습니다…</div>
      ) : (
        <section className="word-grid" aria-live="polite">
          {Object.entries(monthBuckets)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([label, words]) => (
              <article key={label} className="month-panel">
                <header className="panel-header">
                  <div>
                    <p className="eyebrow">{label}권</p>
                    <h2>{words.length}개 단어</h2>
                  </div>
                  <span className="pill">CSV {label}.csv</span>
                </header>
                <div className="word-list">
                  {words.map((entry) => (
                    <WordCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </article>
            ))}
          {!Object.keys(monthBuckets).length && (
            <p className="empty">조건에 맞는 단어가 없습니다. 필터를 초기화해 주세요.</p>
          )}
        </section>
      )}
    </div>
  );
}

function WordCard({ entry }) {
  return (
    <div className="word-card">
      <div className="word-card__head">
        <div>
          <p className="eyebrow">{entry['교과/분야 태그'] || '분야 미정'}</p>
          <h3>
            {entry['단어']}
            <span className="word-pos">{entry['품사']}</span>
          </h3>
          <p className="meaning">{entry['주요 의미(핵심 뜻)']}</p>
        </div>
        <div className="chips">
          <span className="pill primary">난이도 {entry['단어 난이도(1~10)'] || '?'}</span>
          <span className="pill">빈도 {entry['빈도 정도(고/중/저)'] || '-'}</span>
          <span className="pill ghost">{entry.source}권</span>
        </div>
      </div>
      <div className="word-card__body">
        {HEADERS.filter((header) => header !== '단어' && header !== '품사').map((header) => (
          <div className="detail" key={header}>
            <p className="label">{header}</p>
            <p className="value">{entry[header] || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WordsPage;
