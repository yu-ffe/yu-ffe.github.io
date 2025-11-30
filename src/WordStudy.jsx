import { useEffect, useMemo, useState } from 'react';
import './WordStudy.css';

const CSV_FILES = Array.from({ length: 12 }, (_, index) =>
  `/assets/words/${String(index + 1).padStart(2, '0')}.csv`
);

const CSV_DELIMITER = '|';

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

const PRIMARY_FIELDS = [
  '단어',
  '품사',
  '주요 의미(핵심 뜻)',
  '핵심 개념 요약(한 문장)',
  '교과/분야 태그',
  '빈도 정도(고/중/저)',
  '단어 난이도(1~10)',
];

const GROUPS = [
  {
    key: 'background',
    title: '배경·형태',
    fields: [
      '어원·역사적 변천',
      '형태론적 분석(접두사·어근·접미사)',
      '파생어·관련어',
      '의미 확장(현재 쓰임 포함)',
    ],
  },
  {
    key: 'grammar',
    title: '문법·패턴',
    fields: ['뉘앙스·레지스터', '문법적 특징', '자동사/타동사', '가산/불가산', '전치사 패턴', '필수 보어 등'],
  },
  {
    key: 'relations',
    title: '의미 관계',
    fields: ['혼동 주의 단어', '동의어·유사어', '반의어'],
  },
  {
    key: 'usage',
    title: '사용·예문',
    fields: ['콜로케이션(뜻 포함)', '예문(난이도별 2~3개)', '학습 팁'],
  },
  {
    key: 'check',
    title: 'OX & 퀴즈',
    fields: ['OX 체크용 문항(기본값 X)', '미니 퀴즈(3문항 선택형)'],
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
    } else if (char === CSV_DELIMITER && !inQuotes) {
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
  const [collapsedGroups, setCollapsedGroups] = useState({
    background: true,
    grammar: true,
    relations: true,
    usage: false,
    check: true,
  });

  const toggleGroup = (key) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <article className="study-card">
      <div className="card-header">
        <div>
          <p className="word-label">{entry['단어']}</p>
          <p className="pos-label">{entry['품사']}</p>
        </div>
        <div className="badges">
          <span className="badge badge-ghost">{entry.sourceLabel}</span>
          <span className="badge badge-tone">{entry['빈도 정도(고/중/저)'] || '빈도 미정'}</span>
          <span className="badge badge-level">Lv. {entry['단어 난이도(1~10)'] || '—'}</span>
        </div>
      </div>

      <section className="field-grid">
        {PRIMARY_FIELDS.map((field) => (
          <StudyField key={field} label={field} value={entry[field]} />
        ))}
      </section>

      {GROUPS.map((group) => (
        <section key={group.key} className="collapsible">
          <button className="collapse-trigger" type="button" onClick={() => toggleGroup(group.key)}>
            <span>{group.title}</span>
            <span className="chevron">{collapsedGroups[group.key] ? '▼' : '▲'}</span>
          </button>
          <div className={`collapse-content ${collapsedGroups[group.key] ? 'collapsed' : ''}`}>
            {group.fields.map((field) => (
              <StudyField key={field} label={field} value={entry[field]} />
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

  useEffect(() => {
    async function fetchAll() {
      try {
        const results = await Promise.all(
          CSV_FILES.map(async (file) => {
            const res = await fetch(file, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`Failed to load ${file}`);
            const text = await res.text();
            const parsed = parseCsv(text);
            return parsed.map((item) => ({
              ...item,
              source: file,
              sourceLabel: file.split('/').pop()?.replace('.csv', '월 학습') ?? '자료',
            }));
          })
        );

        setEntries(results.flat());
      } catch (err) {
        setError(err.message ?? '단어장을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

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

  return (
    <div className="word-study-layout">
      <header className="study-topbar">
        <div>
          <p className="eyebrow">모바일 최적화 / 전 필드 포함</p>
          <h1>Word Study Lab</h1>
          <p className="subtitle">12권 단어장을 한 번에 모아 빠르게 복습하세요.</p>
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
        <div className="control-hint">
          중요도가 낮은 파트는 접어서, 자주 보는 핵심만 펼쳐두세요.
        </div>
      </section>

      {loading && <p className="status">데이터를 불러오는 중입니다...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <section className="card-stack">
          {filtered.map((entry, index) => (
            <WordCard key={`${entry['단어']}-${index}`} entry={entry} />
          ))}
          {filtered.length === 0 && <p className="status">조건에 맞는 단어가 없습니다.</p>}
        </section>
      )}
    </div>
  );
}
