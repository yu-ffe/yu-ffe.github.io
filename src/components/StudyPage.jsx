import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import './StudyPage.css';

const assetBase = `${import.meta.env.BASE_URL ?? '/'}`;
const CSV_FILES = Array.from({ length: 12 }, (_, index) =>
  `${assetBase}assets/words/${String(index + 1).padStart(2, '0')}.csv`
);

const FIELD_LABELS = [
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

const FREQUENCY_LEVELS = ['전체', '고', '중', '저'];

const difficultyRange = {
  min: 1,
  max: 10,
};

function normalizeEntry(raw, source) {
  const normalized = { source };
  FIELD_LABELS.forEach((label) => {
    const value = raw?.[label];
    normalized[label] = typeof value === 'string' ? value.trim() : value ?? '';
  });

  const difficulty = parseInt(normalized['단어 난이도(1~10)'], 10);
  normalized._difficulty = Number.isFinite(difficulty) ? difficulty : null;
  normalized._frequency = normalized['빈도 정도(고/중/저)']?.replaceAll(' ', '');
  normalized._searchIndex = `${normalized['단어']} ${normalized['주요 의미(핵심 뜻)']} ${normalized['핵심 개념 요약(한 문장)']} ${normalized['콜로케이션(뜻 포함)']} ${normalized['예문(난이도별 2~3개)']}`
    .toLowerCase()
    .normalize('NFC');
  normalized._posTokens = normalized['품사']
    ?.split(/[;,/]/)
    .map((token) => token.trim())
    .filter(Boolean);

  return normalized;
}

async function fetchCsv(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  const text = await response.text();
  const normalizedText = text.replace(/^\uFEFF/, '');
  const parsed = Papa.parse(normalizedText, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });
  if (parsed.errors?.length) {
    console.warn('CSV parse warnings for', path, parsed.errors);
  }
  return parsed.data.map((row) => normalizeEntry(row, path));
}

function buildPosOptions(entries) {
  const posSet = new Set();
  entries.forEach((entry) => {
    entry._posTokens?.forEach((token) => posSet.add(token));
  });
  return Array.from(posSet).sort();
}

function filterEntries(entries, { query, pos, frequency, difficulty }) {
  const normalizedQuery = query.trim().toLowerCase();

  return entries.filter((entry) => {
    if (
      normalizedQuery &&
      !entry._searchIndex.includes(normalizedQuery.normalize('NFC')) &&
      !entry['어원·역사적 변천']?.toLowerCase().includes(normalizedQuery)
    ) {
      return false;
    }

    if (pos && pos.length && !entry._posTokens?.some((token) => pos.includes(token))) {
      return false;
    }

    if (frequency && frequency !== '전체' && entry._frequency !== frequency) {
      return false;
    }

    if (difficulty) {
      const value = entry._difficulty ?? difficultyRange.max;
      if (value < difficulty.min || value > difficulty.max) {
        return false;
      }
    }

    return true;
  });
}

function DifficultyControl({ value, onChange }) {
  return (
    <div className="control-group">
      <div className="control-label">난이도 필터</div>
      <div className="range-row">
        <label>
          최소
          <input
            type="number"
            min={difficultyRange.min}
            max={difficultyRange.max}
            value={value.min}
            onChange={(event) =>
              onChange({ ...value, min: Number(event.target.value) || difficultyRange.min })
            }
          />
        </label>
        <label>
          최대
          <input
            type="number"
            min={difficultyRange.min}
            max={difficultyRange.max}
            value={value.max}
            onChange={(event) =>
              onChange({ ...value, max: Number(event.target.value) || difficultyRange.max })
            }
          />
        </label>
      </div>
      <div className="range-visual">
        <div
          className="range-visual__fill"
          style={{
            left: `${((value.min - difficultyRange.min) / (difficultyRange.max - difficultyRange.min)) * 100}%`,
            right: `${((difficultyRange.max - value.max) / (difficultyRange.max - difficultyRange.min)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

function StudyPage() {
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [posOptions, setPosOptions] = useState([]);
  const [query, setQuery] = useState('');
  const [posFilter, setPosFilter] = useState([]);
  const [frequencyFilter, setFrequencyFilter] = useState('전체');
  const [difficultyFilter, setDifficultyFilter] = useState({ min: 1, max: 10 });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setStatus('loading');
      setError('');
      try {
        const datasets = await Promise.all(CSV_FILES.map((path) => fetchCsv(path)));
        const combined = datasets.flat().filter((entry) => entry['단어']);
        if (cancelled) return;
        setEntries(combined);
        setPosOptions(buildPosOptions(combined));
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError('학습 데이터를 불러오지 못했습니다. 네트워크를 확인해주세요.');
        setStatus('error');
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setFiltered(
      filterEntries(entries, {
        query,
        pos: posFilter,
        frequency: frequencyFilter,
        difficulty: difficultyFilter,
      })
    );
  }, [entries, query, posFilter, frequencyFilter, difficultyFilter]);

  const wordCountByFrequency = useMemo(() => {
    return filtered.reduce(
      (acc, entry) => {
        const level = entry._frequency ?? '기타';
        acc[level] = (acc[level] ?? 0) + 1;
        return acc;
      },
      { 고: 0, 중: 0, 저: 0, 기타: 0 }
    );
  }, [filtered]);

  return (
    <div className="study-page">
      <header className="study-hero">
        <div>
          <p className="eyebrow">Vocabulary Workbench</p>
          <h1>12개월 어휘 아카이브</h1>
          <p className="lede">
            01.csv부터 12.csv까지의 모든 단어를 한 곳에서 정리했어요. 의미·어원·퀴즈 정보까지
            빠짐없이 확인하고, 원하는 기준으로 즉시 필터링해보세요.
          </p>
        </div>
        <div className="hero-metrics">
          <div>
            <span className="metric-number">{entries.length}</span>
            <span className="metric-label">총 단어</span>
          </div>
          <div>
            <span className="metric-number">{filtered.length}</span>
            <span className="metric-label">필터 적용</span>
          </div>
          <div>
            <span className="metric-number">{posOptions.length}</span>
            <span className="metric-label">품사 분류</span>
          </div>
        </div>
      </header>

      <section className="control-panel">
        <div className="control-group">
          <label className="control-label" htmlFor="search-input">
            검색
          </label>
          <input
            id="search-input"
            type="search"
            placeholder="단어, 핵심 의미, 예문 키워드를 입력하세요"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <p className="hint">어원이나 콜로케이션 키워드로도 검색할 수 있어요.</p>
        </div>

        <div className="control-group">
          <div className="control-label">품사</div>
          <div className="chip-row">
            {posOptions.map((option) => {
              const isActive = posFilter.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  className={`chip ${isActive ? 'chip--active' : ''}`}
                  onClick={() =>
                    setPosFilter((prev) =>
                      isActive ? prev.filter((item) => item !== option) : [...prev, option]
                    )
                  }
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="control-group">
          <div className="control-label">빈도</div>
          <div className="pill-row">
            {FREQUENCY_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                className={`pill ${frequencyFilter === level ? 'pill--active' : ''}`}
                onClick={() => setFrequencyFilter(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <DifficultyControl value={difficultyFilter} onChange={setDifficultyFilter} />
      </section>

      <section className="frequency-summary">
        <h2>빈도 분포</h2>
        <div className="bar-grid">
          {Object.entries(wordCountByFrequency).map(([level, count]) => (
            <div key={level} className="bar-row">
              <span className="bar-label">{level}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: entries.length ? `${(count / entries.length) * 100}%` : '0%' }}
                />
              </div>
              <span className="bar-value">{count}개</span>
            </div>
          ))}
        </div>
      </section>

      <section className="word-grid">
        {status === 'loading' && <div className="card status-card">불러오는 중...</div>}
        {status === 'error' && <div className="card status-card error">{error}</div>}
        {status === 'ready' &&
          filtered.map((entry) => (
            <article key={`${entry.source}-${entry['단어']}-${entry['품사']}`} className="card word-card">
              <div className="word-card__header">
                <div>
                  <p className="eyebrow">{entry['품사']}</p>
                  <h3>{entry['단어']}</h3>
                  <p className="meaning">{entry['주요 의미(핵심 뜻)']}</p>
                  <p className="summary">{entry['핵심 개념 요약(한 문장)']}</p>
                </div>
                <div className="badge-group">
                  {entry['빈도 정도(고/중/저)'] && (
                    <span className="badge">빈도: {entry['빈도 정도(고/중/저)']}</span>
                  )}
                  {entry._difficulty && <span className="badge">난이도 {entry._difficulty}/10</span>}
                  {entry['교과/분야 태그'] && <span className="badge">{entry['교과/분야 태그']}</span>}
                  <span className="badge subtle">출처: {entry.source.split('/').pop()}</span>
                </div>
              </div>

              <div className="detail-grid">
                {FIELD_LABELS.filter(
                  (field) => !['단어', '품사', '주요 의미(핵심 뜻)', '핵심 개념 요약(한 문장)'].includes(field)
                ).map((field) => (
                  <div key={field} className="detail-item">
                    <p className="detail-label">{field}</p>
                    <p className="detail-value">{entry[field] || '—'}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
      </section>
    </div>
  );
}

export default StudyPage;
