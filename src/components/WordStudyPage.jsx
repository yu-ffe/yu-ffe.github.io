import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import "./WordStudyPage.css";

const WORD_FILES = Array.from({ length: 12 }, (_, index) => {
  const id = String(index + 1).padStart(2, "0");
  return { id, path: `/assets/words/${id}.csv` };
});

const FIELD_MAP = {
  "단어": "word",
  "품사": "pos",
  "주요 의미(핵심 뜻)": "coreMeaning",
  "핵심 개념 요약(한 문장)": "summary",
  "어원·역사적 변천": "origin",
  "의미 확장(현재 쓰임 포함)": "extended",
  "뉘앙스·레지스터": "nuance",
  "문법적 특징": "grammar",
  "자동사/타동사": "verbType",
  "가산/불가산": "countability",
  "전치사 패턴": "prepositions",
  "필수 보어 등": "complements",
  "형태론적 분석(접두사·어근·접미사)": "morphology",
  "파생어·관련어": "derivatives",
  "혼동 주의 단어": "confusions",
  "동의어·유사어": "synonyms",
  "반의어": "antonyms",
  "콜로케이션(뜻 포함)": "collocations",
  "예문(난이도별 2~3개)": "examples",
  "학습 팁": "tips",
  "교과/분야 태그": "tags",
  "빈도 정도(고/중/저)": "frequency",
  "단어 난이도(1~10)": "difficulty",
  "OX 체크용 문항(기본값 X)": "ox",
  "미니 퀴즈(3문항 선택형)": "quiz",
};

function normalizeRecord(raw, monthId) {
  const normalized = {
    id: typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : `${monthId}-${Math.random().toString(36).slice(2, 10)}`,
    monthId,
  };

  Object.entries(raw).forEach(([key, value]) => {
    const mappedKey = FIELD_MAP[key];
    if (!mappedKey) return;
    normalized[mappedKey] = typeof value === "string" ? value.trim() : value;
  });

  const difficultyNumber = Number.parseInt(normalized.difficulty, 10);
  if (!Number.isNaN(difficultyNumber)) {
    normalized.difficulty = difficultyNumber;
  }

  return normalized;
}

function useWordEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const results = [];

      await Promise.all(
        WORD_FILES.map(async ({ id, path }) => {
          try {
            const response = await fetch(path);
            if (!response.ok) return;
            const csv = await response.text();
            const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true, dynamicTyping: false });
            data.forEach((row) => results.push(normalizeRecord(row, id)));
          } catch (error) {
            console.error(`Failed to load ${path}:`, error);
          }
        })
      );

      if (!cancelled) {
        setEntries(results);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { entries, loading };
}

function InfoChip({ label, children }) {
  if (!children) return null;
  return (
    <span className="chip">
      <strong>{label}</strong>
      <span>{children}</span>
    </span>
  );
}

function EntryCard({ entry }) {
  const {
    word,
    pos,
    coreMeaning,
    summary,
    origin,
    extended,
    nuance,
    grammar,
    verbType,
    countability,
    prepositions,
    complements,
    morphology,
    derivatives,
    confusions,
    synonyms,
    antonyms,
    collocations,
    examples,
    tips,
    tags,
    frequency,
    difficulty,
    ox,
    quiz,
    monthId,
  } = entry;

  const exampleList = examples?.split(/\s*;\s*|\s*\n\s*/).filter(Boolean) ?? [];
  const collocationList = collocations?.split(/\s*;\s*|\s*\n\s*/).filter(Boolean) ?? [];

  return (
    <article className="word-card">
      <header className="word-card__header">
        <div>
          <p className="word-card__month">{monthId}월</p>
          <h3 className="word-card__title">{word}</h3>
          <p className="word-card__pos">{pos}</p>
        </div>
        <div className="word-card__badge">난이도 {difficulty ?? "-"}</div>
      </header>

      <p className="word-card__meaning">{coreMeaning}</p>
      {summary && <p className="word-card__summary">{summary}</p>}

      <div className="word-card__chips">
        <InfoChip label="뉘앙스">{nuance}</InfoChip>
        <InfoChip label="빈도">{frequency}</InfoChip>
        <InfoChip label="품사 디테일">{grammar}</InfoChip>
        <InfoChip label="자동/타동">{verbType}</InfoChip>
        <InfoChip label="가산성">{countability}</InfoChip>
        <InfoChip label="전치사">{prepositions}</InfoChip>
        <InfoChip label="필수 보어">{complements}</InfoChip>
        <InfoChip label="태그">{tags}</InfoChip>
      </div>

      <div className="word-card__section">
        {origin && (
          <div>
            <h4>어원</h4>
            <p>{origin}</p>
          </div>
        )}
        {extended && (
          <div>
            <h4>의미 확장</h4>
            <p>{extended}</p>
          </div>
        )}
        {morphology && (
          <div>
            <h4>형태소</h4>
            <p>{morphology}</p>
          </div>
        )}
      </div>

      <div className="word-card__section two-col">
        <div>
          <h4>동의어 / 유사어</h4>
          <p>{synonyms || "-"}</p>
        </div>
        <div>
          <h4>반의어</h4>
          <p>{antonyms || "-"}</p>
        </div>
      </div>

      <div className="word-card__section two-col">
        <div>
          <h4>파생·관련어</h4>
          <p>{derivatives || "-"}</p>
        </div>
        <div>
          <h4>혼동 주의</h4>
          <p>{confusions || "-"}</p>
        </div>
      </div>

      {collocationList.length > 0 && (
        <div className="word-card__section">
          <h4>콜로케이션</h4>
          <ul>
            {collocationList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {exampleList.length > 0 && (
        <div className="word-card__section">
          <h4>예문</h4>
          <ul>
            {exampleList.map((sentence, index) => (
              <li key={index}>{sentence}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="word-card__footer">
        <div>
          <h4>학습 팁</h4>
          <p>{tips || "-"}</p>
        </div>
        <div>
          <h4>OX 체크 & 미니 퀴즈</h4>
          <p className="word-card__quiz">{ox || "X"}</p>
          {quiz && <p className="word-card__quiz">{quiz}</p>}
        </div>
      </div>
    </article>
  );
}

export default function WordStudyPage() {
  const { entries, loading } = useWordEntries();
  const [activeMonth, setActiveMonth] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return entries.filter((entry) => {
      if (activeMonth !== "all" && entry.monthId !== activeMonth) return false;
      if (!query) return true;
      return [entry.word, entry.coreMeaning, entry.summary, entry.synonyms]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [entries, activeMonth, search]);

  return (
    <div className="word-page">
      <div className="word-hero">
        <div>
          <p className="word-hero__eyebrow">Vocabulary Studio</p>
          <h1>서브 페이지 · 월별 단어 학습</h1>
          <p className="word-hero__lead">
            assets/words의 01~12.csv를 불러와 품사, 뉘앙스, 예문까지 한눈에 정리했습니다.
            검은색 책을 클릭하면 이 페이지로 이동합니다.
          </p>
          <div className="word-hero__actions">
            <button type="button" onClick={() => (window.location.href = "/")}>🏠 메인으로</button>
            <a className="primary" href="#study">바로 학습하기</a>
          </div>
        </div>
        <div className="word-hero__panel">
          <p className="word-hero__label">총 {entries.length}개 어휘</p>
          <p className="word-hero__label subtle">월 선택 후 키워드 검색으로 원하는 단어를 찾아보세요.</p>
        </div>
      </div>

      <section id="study" className="word-controls">
        <div className="chip-select">
          <button className={activeMonth === "all" ? "active" : ""} onClick={() => setActiveMonth("all")}>
            전체
          </button>
          {WORD_FILES.map(({ id }) => (
            <button key={id} className={activeMonth === id ? "active" : ""} onClick={() => setActiveMonth(id)}>
              {id}월
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="단어, 의미, 유의어 검색"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      {loading ? (
        <p className="word-status">데이터를 불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p className="word-status">선택한 조건에 맞는 단어가 없습니다.</p>
      ) : (
        <div className="word-grid">
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
