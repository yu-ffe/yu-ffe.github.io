import { useEffect, useMemo, useState } from 'react';
import './LexiconLab.css';

const SETTINGS_COOKIE = 'lexiconLabSettings';
const POSITION_COOKIE = 'lexiconLabPosition';
// TODO: Remove MOBILE_PREVIEW once desktop view is restored.
const MOBILE_PREVIEW = true;

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
  const renderItem = (item) => {
    if (typeof item === 'string') return item;
    if (item?.word) return `${item.word}${item.meaning_ko ? ` (${item.meaning_ko})` : ''}`;
    return '';
  };

  return (
    <div className="pill-row">
      <span className="pill-label">{label}</span>
      <div className="pill-items">
        {items.map((item, index) => (
          <span className="pill" key={`${renderItem(item)}-${index}`}>
            {renderItem(item)}
          </span>
        ))}
      </div>
    </div>
  );
}

function MeaningList({ meanings, limit }) {
  const limited = useMemo(() => meanings?.slice(0, limit) ?? [], [limit, meanings]);

  if (!limited.length) return <p className="muted">뜻 정보가 없습니다.</p>;

  return (
    <ol className="meaning-list">
      {limited.map((meaning, index) => (
        <li key={`${meaning.definition_en}-${index}`}>
          <span className="badge">{index + 1}</span>
          <div className="meaning-texts">
            <p className="meaning-en">{meaning.definition_en}</p>
            <p className="meaning-ko">{meaning.definition_ko}</p>
            {meaning.note && <p className="meaning-note">{meaning.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function PrepositionPatternList({ patterns }) {
  if (!patterns?.length) return <p className="muted">전치사 패턴 정보가 없습니다.</p>;
  return (
    <ul className="preposition-list">
      {patterns.map((pattern, index) => (
        <li key={`${pattern.prep}-${index}`}>
          <span className="pill">{pattern.prep}</span>
          <div>
            <p className="meaning-ko">{pattern.meaning_ko}</p>
            {pattern.example && <p className="meaning-note">예: {pattern.example}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function CollocationList({ groups }) {
  if (!groups || groups.length === 0) return <p className="muted">콜로케이션 정보가 없습니다.</p>;
  return (
    <div className="collocation-groups">
      {groups.map((group) => (
        <div key={group.level} className="collocation-group">
          <p className="level-label">레벨 {group.level}</p>
          <ul className="collocation-list">
            {group.items?.length ? (
              group.items.map((item, index) => (
                <li key={`${item.phrase}-${index}`}>
                  <div className="collocation-head">
                    <span className="phrase">{item.phrase}</span>
                    <span className="collocation-meaning">{item.meaning_ko}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="muted">이 레벨의 콜로케이션이 없습니다.</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ExampleList({ examples }) {
  if (!examples || examples.length === 0) return <p className="muted">예문이 없습니다.</p>;
  return (
    <div className="example-groups">
      {examples.map((group) => (
        <div key={group.level} className="example-group">
          <p className="level-label">레벨 {group.level}</p>
          <ol className="example-list">
            {group.items?.length ? (
              group.items.map((item, index) => (
                <li key={`${item.sentence}-${index}`}>
                  <p className="meaning-en">{item.sentence}</p>
                  <p className="meaning-ko">{item.meaning_ko}</p>
                </li>
              ))
            ) : (
              <li className="muted">예문이 없습니다.</li>
            )}
          </ol>
        </div>
      ))}
    </div>
  );
}

function QuizList({ quiz }) {
  if (!quiz || quiz.length === 0) return null;
  return (
    <div className="quiz-list">
      <p className="quiz-title">미니 퀴즈</p>
      {quiz.map((group) => (
        <div key={group.level} className="quiz-group">
          <p className="level-label">레벨 {group.level}</p>
          <ol>
            {group.items?.length ? (
              group.items.map((item, index) => (
                <li key={`${item.q}-${index}`}>
                  <p className="quiz-question">{item.q}</p>
                  <p className="meaning-note">{item.meaning_ko}</p>
                  <div className="quiz-choices">
                    <span className="choice answer">{item.a}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="muted">이 레벨의 퀴즈가 없습니다.</li>
            )}
          </ol>
        </div>
      ))}
    </div>
  );
}

function LexiconEntry({ entry, settings }) {
  return (
    <article className="lex-card">
      <header className="lex-card-header">
        <div>
          <p className="entry-word">{entry.word}</p>
          <p className="entry-pos">{Array.isArray(entry.partOfSpeech) ? entry.partOfSpeech.join(' / ') : entry.partOfSpeech}</p>
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
            <PrepositionPatternList patterns={entry.prepositionPatterns} />
            <div className="required-complements">
              <p className="label">필수 보어</p>
              {entry.requiredComplements?.length ? (
                <ul className="simple-list">
                  {entry.requiredComplements.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">필수 보어 정보가 없습니다.</p>
              )}
            </div>
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
        <CollocationList groups={entry.collocations} />
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

export default function LexiconLab() {
  const [settings, setSettings] = useState(defaultSettings);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
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
    async function loadEntries() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/assets/lexicon/lexicon.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('단어장 데이터를 불러올 수 없습니다.');
        const data = await res.json();
        setEntries(data);
      } catch (err) {
        setError(err.message || '데이터를 불러오지 못했습니다.');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }

    loadEntries();
  }, []);

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

  return (
    <div className={`lex-page ${MOBILE_PREVIEW ? 'lex-page--mobile' : ''}`}>
        <header className="lex-topbar">
          <div />
          <div className="top-actions">
            <button className="panel-toggle" type="button" onClick={() => setPanelOpen((v) => !v)} aria-label="설정 열기">
              =
            </button>
          </div>
        </header>

      {loading && <p className="status">목록을 불러오는 중입니다...</p>}
      {error && <p className="status error">{error}</p>}

        {!loading && !error && entries.length === 0 && <p className="status">단어 데이터가 없습니다.</p>}

      {entries.map((entry) => (
        <LexiconEntry key={entry.word} entry={entry} settings={settings} />
      ))}

      <SettingsPanel open={panelOpen} settings={settings} onChange={setSettings} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
