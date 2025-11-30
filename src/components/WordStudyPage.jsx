import { useEffect, useMemo, useState } from 'react';
import './WordStudyPage.css';

const CSV_FILES = Array.from({ length: 12 }, (_, index) =>
  `/assets/words/${String(index + 1).padStart(2, '0')}.csv`
);

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

const frequencyWeight = { 고: 3, 중: 2, 저: 1 };

function parseCSV(text) {
  const rows = [];
  let currentField = '';
  let currentRow = [];
  let inQuotes = false;
  const cleanText = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < cleanText.length; i += 1) {
    const char = cleanText[i];
    const next = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        currentField += '"';
        i += 1;
        continue;
      }
      if (char === '"' && next !== '"') {
        inQuotes = false;
        continue;
      }
      currentField += char;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      currentRow.push(currentField.trim());
      currentField = '';
      continue;
    }

    if (char === '\n') {
      currentRow.push(currentField.trim());
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      continue;
    }

    if (char === '\r') {
      continue;
    }

    currentField += char;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((cell) => cell.length > 0));
}

function normalizeRecords(rows) {
  if (!rows.length) return [];
  const hasHeader = rows[0][0]?.includes('단어') || rows[0].length > HEADERS.length - 3;
  const contentRows = hasHeader ? rows.slice(1) : rows;

  return contentRows.map((cells) => {
    const record = {};
    HEADERS.forEach((header, index) => {
      record[header] = cells[index]?.trim() ?? '';
    });

    const difficulty = Number(record['단어 난이도(1~10)']);
    record.__difficulty = Number.isFinite(difficulty) ? difficulty : null;
    record.__frequencyWeight = frequencyWeight[record['빈도 정도(고/중/저)']] ?? 0;
    record.__primaryTag = record['교과/분야 태그']?.split(/[;,/]/)[0]?.trim() ?? '';

    return record;
  });
}

function buildSearchText(record) {
  return [
    record['단어'],
    record['주요 의미(핵심 뜻)'],
    record['핵심 개념 요약(한 문장)'],
    record['콜로케이션(뜻 포함)'],
    record['예문(난이도별 2~3개)'],
    record['미니 퀴즈(3문항 선택형)'],
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function WordStudyPage({ onNavigateHome }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [frequency, setFrequency] = useState('all');
  const [posFilter, setPosFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [maxDifficulty, setMaxDifficulty] = useState(10);
  const [sortKey, setSortKey] = useState('score');

  useEffect(() => {
    let isMounted = true;

    const loadAll = async () => {
      try {
        const texts = await Promise.all(
          CSV_FILES.map((file) =>
            fetch(file, { cache: 'no-cache' })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`Failed to load ${file}`);
                }
                return response.text();
              })
              .catch((fetchError) => {
                throw new Error(fetchError.message);
              })
          )
        );

        if (!isMounted) return;

        const parsed = texts
          .map(parseCSV)
          .flatMap((rows) => normalizeRecords(rows));

        setEntries(parsed);
        setLoading(false);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message);
        setLoading(false);
      }
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, []);

  const searchText = search.trim().toLowerCase();

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        if (frequency !== 'all' && entry['빈도 정도(고/중/저)'] !== frequency) {
          return false;
        }

        if (posFilter !== 'all' && !entry['품사'].toLowerCase().includes(posFilter)) {
          return false;
        }

        if (tagFilter !== 'all' && !entry['교과/분야 태그'].includes(tagFilter)) {
          return false;
        }

        if (entry.__difficulty && entry.__difficulty > maxDifficulty) {
          return false;
        }

        if (searchText) {
          const haystack = buildSearchText(entry);
          if (!haystack.includes(searchText)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortKey === 'difficulty') {
          return (a.__difficulty ?? 99) - (b.__difficulty ?? 99);
        }
        if (sortKey === 'frequency') {
          return (b.__frequencyWeight ?? 0) - (a.__frequencyWeight ?? 0);
        }
        if (sortKey === 'word') {
          return a['단어'].localeCompare(b['단어']);
        }

        const scoreA = (a.__frequencyWeight ?? 0) * 2 + (10 - (a.__difficulty ?? 10));
        const scoreB = (b.__frequencyWeight ?? 0) * 2 + (10 - (b.__difficulty ?? 10));
        return scoreB - scoreA;
      });
  }, [entries, frequency, posFilter, tagFilter, maxDifficulty, searchText, sortKey]);

  const stats = useMemo(() => {
    if (!entries.length) {
      return { total: 0, avgDifficulty: 0, highFreq: 0, topTags: [] };
    }

    const total = entries.length;
    const difficulties = entries
      .map((entry) => entry.__difficulty)
      .filter((value) => Number.isFinite(value));
    const avgDifficulty = difficulties.reduce((sum, value) => sum + value, 0) / Math.max(1, difficulties.length);

    const highFreq = entries.filter((entry) => entry['빈도 정도(고/중/저)'] === '고').length;
    const tagCounts = entries.reduce((map, entry) => {
      const tags = entry['교과/분야 태그']?.split(/[;,/]/).map((tag) => tag.trim()).filter(Boolean) ?? [];
      tags.forEach((tag) => {
        map[tag] = (map[tag] ?? 0) + 1;
      });
      return map;
    }, {});

    const topTags = Object.entries(tagCounts)
      .sort(([, aCount], [, bCount]) => bCount - aCount)
      .slice(0, 6)
      .map(([label]) => label);

    return { total, avgDifficulty: Number(avgDifficulty.toFixed(1)), highFreq, topTags };
  }, [entries]);

  const posOptions = useMemo(() => {
    const set = new Set();
    entries.forEach((entry) => {
      entry['품사']?.split(/[\/]/).forEach((token) => {
        const cleaned = token.trim();
        if (cleaned) set.add(cleaned.toLowerCase());
      });
    });
    return Array.from(set).sort();
  }, [entries]);

  const tagOptions = useMemo(() => {
    const set = new Set();
    entries.forEach((entry) => {
      entry['교과/분야 태그']
        ?.split(/[;,/]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach((tag) => set.add(tag));
    });
    return Array.from(set).sort();
  }, [entries]);

  const handleHome = () => {
    if (typeof onNavigateHome === 'function') {
      onNavigateHome();
      return;
    }
    window.location.assign('/');
  };

  return (
    <div className="study-page">
      <header className="study-hero">
        <div className="hero-text">
          <p className="eyebrow">Word Study Lab</p>
          <h1>
            12개월 어휘 노트를 한눈에 정리하고, 필요한 항목만 골라 복습하세요.
          </h1>
          <p className="hero-subtitle">
            CSV에 담긴 모든 메타데이터(품사, 어원, 콜로케이션, 퀴즈 등)를 카드로 펼쳐 보면서
            빈도·난이도·태그별로 즉시 필터링할 수 있는 학습 공간입니다.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => window.scrollTo({ top: 480, behavior: 'smooth' })}>
              학습 카드로 바로 이동
            </button>
            <button className="ghost" data-spa-link="true" onClick={handleHome}>
              서재 화면으로 돌아가기
            </button>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-item">
            <span>총 단어</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="panel-item">
            <span>평균 난이도</span>
            <strong>{stats.avgDifficulty}</strong>
          </div>
          <div className="panel-item">
            <span>고빈도 어휘</span>
            <strong>{stats.highFreq}</strong>
          </div>
          <div className="panel-item tags">
            <span>상위 태그</span>
            <div className="tag-chips">
              {stats.topTags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="filters">
        <div className="field">
          <label htmlFor="search">검색</label>
          <input
            id="search"
            type="search"
            placeholder="단어, 핵심 뜻, 예문, 미니 퀴즈 등"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="field">
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
        <div className="field">
          <label htmlFor="pos">품사</label>
          <select id="pos" value={posFilter} onChange={(event) => setPosFilter(event.target.value)}>
            <option value="all">전체</option>
            {posOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="tag">교과/분야</label>
          <select id="tag" value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
            <option value="all">전체</option>
            {tagOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="difficulty">최대 난이도: {maxDifficulty}</label>
          <input
            id="difficulty"
            type="range"
            min="1"
            max="10"
            value={maxDifficulty}
            onChange={(event) => setMaxDifficulty(Number(event.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="sort">정렬</label>
          <select id="sort" value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
            <option value="score">추천순(빈도/난이도)</option>
            <option value="difficulty">난이도 낮은순</option>
            <option value="frequency">빈도 높은순</option>
            <option value="word">알파벳순</option>
          </select>
        </div>
      </section>

      {error && <p className="error">데이터를 불러오는 중 문제가 발생했습니다: {error}</p>}
      {loading && <p className="muted">CSV를 불러오는 중...</p>}

      <section className="card-grid" aria-live="polite">
        {filteredEntries.map((entry) => (
          <article key={`${entry['단어']}-${entry['품사']}`} className="word-card">
            <header className="card-header">
              <div>
                <p className="eyebrow">{entry['교과/분야 태그']}</p>
                <h2>{entry['단어']}</h2>
                <p className="lead">{entry['주요 의미(핵심 뜻)']}</p>
              </div>
              <div className="badges">
                <span className="badge">품사: {entry['품사']}</span>
                <span className="badge">빈도: {entry['빈도 정도(고/중/저)'] || ' - '}</span>
                <span className="badge">난이도: {entry['단어 난이도(1~10)'] || ' - '}</span>
              </div>
            </header>

            <dl className="fact-grid">
              <Fact label="핵심 개념 요약" value={entry['핵심 개념 요약(한 문장)']} />
              <Fact label="어원·역사적 변천" value={entry['어원·역사적 변천']} />
              <Fact label="의미 확장" value={entry['의미 확장(현재 쓰임 포함)']} />
              <Fact label="뉘앙스·레지스터" value={entry['뉘앙스·레지스터']} />
              <Fact label="문법적 특징" value={entry['문법적 특징']} />
              <Fact label="자동사/타동사" value={entry['자동사/타동사']} />
              <Fact label="가산/불가산" value={entry['가산/불가산']} />
              <Fact label="전치사 패턴" value={entry['전치사 패턴']} />
              <Fact label="필수 보어" value={entry['필수 보어 등']} />
              <Fact label="형태론적 분석" value={entry['형태론적 분석(접두사·어근·접미사)']} />
              <Fact label="파생어·관련어" value={entry['파생어·관련어']} />
              <Fact label="혼동 주의 단어" value={entry['혼동 주의 단어']} />
              <Fact label="동의어·유사어" value={entry['동의어·유사어']} />
              <Fact label="반의어" value={entry['반의어']} />
              <Fact label="콜로케이션" value={entry['콜로케이션(뜻 포함)']} />
              <Fact label="예문" value={entry['예문(난이도별 2~3개)']} />
              <Fact label="학습 팁" value={entry['학습 팁']} />
              <Fact label="OX 체크" value={entry['OX 체크용 문항(기본값 X)'] || 'X'} />
              <Fact label="미니 퀴즈" value={entry['미니 퀴즈(3문항 선택형)']} />
            </dl>
          </article>
        ))}
        {!loading && filteredEntries.length === 0 && (
          <p className="muted">조건에 맞는 카드가 없습니다. 필터를 조정해 주세요.</p>
        )}
      </section>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="fact">
      <dt>{label}</dt>
      <dd>{value || '정보 없음'}</dd>
    </div>
  );
}

export default WordStudyPage;
