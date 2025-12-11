import { useEffect, useMemo, useState } from 'react';
import './LexiconLab.css';

const SETTINGS_COOKIE = 'lexiconLabSettings';
const BOOK_COOKIE = 'lexiconLabBook';
const POSITION_COOKIE = 'lexiconLabPosition';

const defaultSettings = {
  showConcept: true,
  meaningLimit: 3,
  showClassification: true,
};

function readCookie(name) {
  if (typeof document === 'undefined') return '';
  const value = document.cookie
    .split('; ')
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.split('=')[1]) : '';
}

function writeCookie(name, value, days = 90) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function SettingToggle({ label, checked, onChange, description }) {
  return (
    <label className="setting-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div>
        <p className="setting-label">{label}</p>
        {description && <p className="setting-desc">{description}</p>}
      </div>
    </label>
  );
}

function SettingsPanel({ open, settings, onChange, onClose }) {
  return (
    <aside className={`settings-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
      <header className="settings-header">
        <div>
          <p className="eyebrow">맞춤 설정</p>
          <h2>Lexicon Control</h2>
        </div>
        <button className="ghost" type="button" onClick={onClose} aria-label="설정 닫기">
          ✕
        </button>
      </header>

      <SettingToggle
        label="개념 표시"
        description="핵심 개념 요약 문장을 카드에 노출합니다."
        checked={settings.showConcept}
        onChange={(value) => onChange({ ...settings, showConcept: value })}
      />

      <div className="setting-field">
        <label htmlFor="meaningLimit">뜻 표시 개수</label>
        <input
          id="meaningLimit"
          type="number"
          min="1"
          max="10"
          value={settings.meaningLimit}
          onChange={(e) => onChange({ ...settings, meaningLimit: Number(e.target.value) || 1 })}
        />
        <p className="setting-desc">주요 뜻을 중요도 순서대로 최대 N개까지 보여 줍니다.</p>
      </div>

      <SettingToggle
        label="분류/태그 표시"
        description="태그, 빈도, 난이도 등 메타 정보를 함께 보여 줍니다."
        checked={settings.showClassification}
        onChange={(value) => onChange({ ...settings, showClassification: value })}
      />
    </aside>
  );
}

function Section({ title, children }) {
  return (
    <section className="lex-section">
      <p className="lex-section-title">{title}</p>
      <div className="lex-section-body">{children}</div>
    </section>
  );
}

function PillList({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="pill-row">
      <span className="pill-label">{label}</span>
      <div className="pill-items">
        {items.map((item) => (
          <span className="pill" key={item}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function MeaningList({ meanings, limit }) {
  const sorted = useMemo(() => {
    return [...(meanings ?? [])].sort((a, b) => (a.importance ?? 999) - (b.importance ?? 999));
  }, [meanings]);

  return (
    <ol className="meaning-list">
      {sorted.slice(0, limit).map((meaning, index) => (
        <li key={`${meaning.definition}-${index}`}>
          <span className="badge">{index + 1}</span>
          {meaning.definition}
        </li>
      ))}
    </ol>
  );
}

function CollocationList({ items }) {
  if (!items || items.length === 0) return <p className="muted">콜로케이션 정보가 없습니다.</p>;
  return (
    <ul className="collocation-list">
      {items.map((item, index) => (
        <li key={`${item.phrase}-${index}`}>
          <div className="collocation-head">
            <span className="phrase">{item.phrase}</span>
            <span className="collocation-meaning">{item.meaning}</span>
          </div>
          <p className="collocation-example">{item.example}</p>
        </li>
      ))}
    </ul>
  );
}

function ExampleList({ examples }) {
  if (!examples || examples.length === 0) return <p className="muted">예문이 없습니다.</p>;
  return (
    <ol className="example-list">
      {examples.map((item, index) => (
        <li key={`${item.sentence}-${index}`}>
          <p>{item.sentence}</p>
          {item.senseHint && <span className="example-hint">{item.senseHint}</span>}
        </li>
      ))}
    </ol>
  );
}

function QuizList({ quiz }) {
  if (!quiz || quiz.length === 0) return null;
  return (
    <div className="quiz-list">
      <p className="quiz-title">미니 퀴즈</p>
      <ol>
        {quiz.map((item, index) => (
          <li key={`${item.question}-${index}`}>
            <p className="quiz-question">{item.question}</p>
            <div className="quiz-choices">
              {item.choices.map((choice) => (
                <span key={choice} className={`choice ${choice === item.answer ? 'answer' : ''}`}>
                  {choice}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LexiconEntry({ entry, settings }) {
  return (
    <article className="lex-card">
      <header className="lex-card-header">
        <div>
          <p className="entry-word">{entry.word}</p>
          <p className="entry-pos">{entry.partOfSpeech}</p>
        </div>
        <div className="meta-right">
          {settings.showClassification && entry.frequency && <span className="chip ghost">빈도 {entry.frequency}</span>}
          {settings.showClassification && entry.difficulty && <span className="chip">Lv.{entry.difficulty}</span>}
        </div>
      </header>

      <Section title="단어 · 품사 · 핵심개념 · 뜻 · 파생어 · 관련어 · 반의어">
        {settings.showConcept && entry.concept && <p className="concept">{entry.concept}</p>}
        <MeaningList meanings={entry.meanings} limit={settings.meaningLimit} />
        <PillList label="파생어" items={entry.derivatives} />
        <PillList label="관련어" items={entry.related} />
        <PillList label="동의어" items={entry.synonyms} />
        <PillList label="유사어" items={entry.nearSynonyms} />
        <PillList label="반의어" items={entry.antonyms} />
      </Section>

      <Section title="의미 확장 (상황/쓰임 등)">
        <p>{entry.semanticExtension || '의미 확장 정보 없음'}</p>
        {entry.nuanceRegister && <p className="muted">뉘앙스·레지스터: {entry.nuanceRegister}</p>}
      </Section>

      <Section title="형태 분석 / 어원 / 전치사 패턴 · 보어">
        <div className="grid-two">
          <div>
            <p className="label">형태 분석</p>
            <p>{entry.morphology || '—'}</p>
            <p className="label">어원·역사적 변천</p>
            <p>{entry.etymology || '—'}</p>
          </div>
          <div>
            <p className="label">전치사 패턴 · 보어</p>
            <PillList label="패턴" items={entry.prepositionPatterns} />
            <PillList label="필수 보어" items={entry.requiredComplements} />
            <p className="label">문법적 특징</p>
            <p>{entry.grammarNotes || '—'}</p>
            <p className="label">자동사 / 타동사</p>
            <p>{entry.transitivity || '—'}</p>
            <p className="label">가산 / 불가산</p>
            <p>{entry.countability || '—'}</p>
          </div>
        </div>
      </Section>

      <Section title="콜로케이션 · 예문">
        <CollocationList items={entry.collocations} />
        <ExampleList examples={entry.examples} />
      </Section>

      <Section title="학습 팁">
        <p>{entry.studyTips || '학습 팁이 아직 없습니다.'}</p>
      </Section>

      {settings.showClassification && (
        <Section title="기타 (태그/분야 · 빈도 · 난이도)">
          <PillList label="태그" items={entry.tags} />
          <p className="label">빈도 · 난이도</p>
          <p>
            {entry.frequency || '—'} / Lv.{entry.difficulty || '—'}
          </p>
        </Section>
      )}

      <QuizList quiz={entry.quiz} />
    </article>
  );
}

function BookShelf({ books, selectedBookId, onSelect }) {
  return (
    <div className="bookshelf">
      {books.map((book) => {
        const active = book.id === selectedBookId;
        return (
          <button
            key={book.id}
            type="button"
            className={`book ${active ? 'active' : ''}`}
            style={{ borderColor: book.accent, background: active ? book.accent : 'transparent' }}
            onClick={() => onSelect(book.id)}
          >
            <span className="book-label">{book.title}</span>
            <span className="book-desc">{book.description}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function LexiconLab() {
  const [settings, setSettings] = useState(defaultSettings);
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookLoading, setBookLoading] = useState(false);
  const [error, setError] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const saved = readCookie(SETTINGS_COOKIE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (err) {
        console.warn('설정 쿠키를 불러오지 못했습니다.', err);
      }
    }
  }, []);

  useEffect(() => {
    writeCookie(SETTINGS_COOKIE, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    async function loadBooks() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/assets/lexicon/books.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('단어장 목록을 불러올 수 없습니다.');
        const data = await res.json();
        setBooks(data);
      } catch (err) {
        setError(err.message || '목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  useEffect(() => {
    if (books.length === 0) return;
    const savedBook = readCookie(BOOK_COOKIE);
    if (savedBook && books.some((book) => book.id === savedBook)) {
      setSelectedBookId(savedBook);
    } else {
      setSelectedBookId(books[0].id);
    }
  }, [books]);

  useEffect(() => {
    if (!selectedBookId) return;
    const target = books.find((book) => book.id === selectedBookId);
    if (!target) return;

    async function loadBook() {
      setBookLoading(true);
      setError('');
      try {
        const res = await fetch(target.dataPath, { cache: 'no-cache' });
        if (!res.ok) throw new Error('단어장 데이터를 불러올 수 없습니다.');
        const data = await res.json();
        setEntries(data);
        writeCookie(BOOK_COOKIE, selectedBookId);
      } catch (err) {
        setError(err.message || '데이터를 불러오지 못했습니다.');
        setEntries([]);
      } finally {
        setBookLoading(false);
      }
    }

    loadBook();
  }, [selectedBookId, books]);

  useEffect(() => {
    if (!entries.length) return;
    const saved = Number(readCookie(POSITION_COOKIE));
    if (!Number.isNaN(saved) && saved > 0) {
      window.scrollTo({ top: saved, behavior: 'smooth' });
    }
  }, [entries]);

  useEffect(() => {
    const handleScroll = () => {
      writeCookie(POSITION_COOKIE, String(Math.round(window.scrollY)));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeBook = useMemo(() => books.find((book) => book.id === selectedBookId), [books, selectedBookId]);

  return (
    <div className="lex-page">
      <header className="lex-topbar">
        <div>
          <p className="eyebrow">신규 포맷 / 다중 필드 지원</p>
          <h1>Lexicon Lab</h1>
          <p className="subtitle">책을 선택하고, 나만의 보기 설정을 적용하세요.</p>
        </div>
        <div className="top-actions">
          <a className="ghost" href="/">3D 방으로 돌아가기</a>
          <button className="panel-toggle" type="button" onClick={() => setPanelOpen((v) => !v)} aria-label="설정 열기">
            =
          </button>
        </div>
      </header>

      <BookShelf books={books} selectedBookId={selectedBookId} onSelect={setSelectedBookId} />

      {activeBook && (
        <div className="book-banner" style={{ borderColor: activeBook.accent }}>
          <p className="book-name">{activeBook.title}</p>
          <p className="book-note">{activeBook.description}</p>
        </div>
      )}

      {loading && <p className="status">목록을 불러오는 중입니다...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && entries.length === 0 && <p className="status">선택한 책에 단어가 없습니다.</p>}

      {entries.map((entry) => (
        <LexiconEntry key={entry.word} entry={entry} settings={settings} />
      ))}

      <SettingsPanel open={panelOpen} settings={settings} onChange={setSettings} onClose={() => setPanelOpen(false)} />
      {bookLoading && <div className="inline-status">선택한 책을 불러오는 중...</div>}
    </div>
  );
}
