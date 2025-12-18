import { useEffect, useMemo, useState } from 'react';
import './LexiconLab.css';

const SETTINGS_COOKIE = 'lexiconLabSettings';
const POSITION_COOKIE = 'lexiconLabPosition';
// TODO: Remove MOBILE_PREVIEW once desktop view is restored.
const MOBILE_PREVIEW = true;

const wordSources = import.meta.glob('../public/assets/words/json/*.json', { eager: true });

const defaultSettings = {
  showConcept: true,
  meaningLimit: 3,
  showClassification: true,
  showRelations: true,
  showUsageContext: true,
  showFormDetails: true,
  showCollocations: true,
  showExamples: true,
  showQuiz: true,
  showKoreanMeanings: true,
  levelMode: 'all',
  selectedLevels: ['상', '중', '하'],
  quizItemLimit: 3,
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

function loadWordEntries() {
  const modules = Object.entries(wordSources).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  return modules.flatMap(([, mod]) => {
    const payload = mod?.default ?? mod;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.words)) return payload.words;
    return [];
  });
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

function SettingGroup({ title, description, children }) {
  return (
    <section className="setting-group">
      <header>
        <p className="group-title">{title}</p>
        {description && <p className="group-desc">{description}</p>}
      </header>
      <div className="group-body">{children}</div>
    </section>
  );
}

function SettingsPanel({ open, settings, onChange, onClose, levelOptions }) {
  const safeLevels = levelOptions?.length ? Array.from(new Set(levelOptions)) : ['상', '중', '하'];

  const handleLevelToggle = (level) => {
    const exists = settings.selectedLevels.includes(level);
    const next = exists
      ? settings.selectedLevels.filter((item) => item !== level)
      : [...settings.selectedLevels, level];
    const ensured = next.length ? next : [level];
    onChange({ ...settings, selectedLevels: ensured });
  };

  const handleQuizLimitChange = (value) => {
    const parsed = Number(value);
    const nextValue = Number.isNaN(parsed) ? settings.quizItemLimit : Math.min(10, Math.max(1, parsed));
    onChange({ ...settings, quizItemLimit: nextValue });
  };

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

      <SettingGroup title="카드 헤더" description="단어 카드 상단에서 노출할 정보를 고릅니다.">
        <div className="settings-grid">
          <SettingToggle
            label="개념 표시"
            description="핵심 개념 요약 문장을 카드에 노출합니다."
            checked={settings.showConcept}
            onChange={(value) => onChange({ ...settings, showConcept: value })}
          />

          <SettingToggle
            label="분류/태그 표시"
            description="태그, 빈도, 난이도 등 메타 정보를 함께 보여 줍니다."
            checked={settings.showClassification}
            onChange={(value) => onChange({ ...settings, showClassification: value })}
          />
        </div>
      </SettingGroup>

      <SettingGroup title="뜻 · 관계" description="의미 설명과 연결 관계를 얼마나 보여 줄지 제어합니다.">
        <div className="setting-field">
          <label htmlFor="meaningLimit">뜻 표시 개수</label>
          <input
            id="meaningLimit"
            type="number"
            min="1"
            max="10"
            value={settings.meaningLimit}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              const nextValue = Number.isNaN(parsed) ? 1 : Math.min(10, Math.max(1, parsed));
              onChange({ ...settings, meaningLimit: nextValue });
            }}
          />
          <p className="setting-desc">주요 뜻을 중요도 순서대로 최대 N개까지 보여 줍니다.</p>
        </div>

        <SettingToggle
          label="단어 관계 표시"
          description="파생어, 관련어, 동의/반의어 등 연결 관계 카테고리를 보여 줍니다."
          checked={settings.showRelations}
          onChange={(value) => onChange({ ...settings, showRelations: value })}
        />
      </SettingGroup>

      <SettingGroup
        title="레벨 노출 방식"
        description="lexicon.json에서 감지한 레벨(상/중/하)을 한 번에 볼지, 필요한 것만 골라 볼지 선택하세요."
      >
        <div className="radio-row">
          <label>
            <input
              type="radio"
              name="levelMode"
              value="all"
              checked={settings.levelMode === 'all'}
              onChange={(e) => onChange({ ...settings, levelMode: e.target.value })}
            />
            전체 레벨 연속 보기
          </label>
          <label>
            <input
              type="radio"
              name="levelMode"
              value="custom"
              checked={settings.levelMode === 'custom'}
              onChange={(e) => onChange({ ...settings, levelMode: e.target.value })}
            />
            선택한 레벨만 보기
          </label>
        </div>

        <div className="level-picker" aria-label="레벨 선택">
          {safeLevels.map((level) => (
            <button
              key={level}
              type="button"
              className={`level-chip ${settings.selectedLevels.includes(level) ? 'active' : ''}`}
              onClick={() => handleLevelToggle(level)}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="setting-desc">선택한 레벨의 콜로케이션/예문/퀴즈만 보여 줍니다.</p>
      </SettingGroup>

        <SettingGroup title="언어 · 힌트" description="한국어 뜻이나 해설을 숨기고 영어 원문만 확인할 수 있습니다.">
          <SettingToggle
            label="한국어 뜻 표시"
            description="의미, 예문 해석, 선택형 퀴즈 힌트를 함께 보여 줍니다."
            checked={settings.showKoreanMeanings}
            onChange={(value) => onChange({ ...settings, showKoreanMeanings: value })}
          />
        </SettingGroup>

      <SettingGroup title="맥락 · 문법" description="학습 시 보고 싶은 설명 영역을 세분화합니다.">
        <SettingToggle
          label="사용 맥락/뉘앙스"
          description="의미 확장과 학습 노트를 함께 표시합니다."
          checked={settings.showUsageContext}
          onChange={(value) => onChange({ ...settings, showUsageContext: value })}
        />

        <SettingToggle
          label="형태·전치사·문법"
          description="형태 분석, 전치사 패턴, 필수 보어 등 문법 정보를 표시합니다."
          checked={settings.showFormDetails}
          onChange={(value) => onChange({ ...settings, showFormDetails: value })}
        />
      </SettingGroup>

      <SettingGroup title="학습 자료" description="실제 사용 예시와 연습 문제 노출 여부를 선택하세요.">
        <div className="settings-grid">
          <SettingToggle
            label="콜로케이션"
            description="레벨별 자주 쓰이는 어휘 조합을 표시합니다."
            checked={settings.showCollocations}
            onChange={(value) => onChange({ ...settings, showCollocations: value })}
          />
          <SettingToggle
            label="예문"
            description="레벨별 예문 리스트를 표시합니다."
            checked={settings.showExamples}
            onChange={(value) => onChange({ ...settings, showExamples: value })}
          />
          <SettingToggle
            label="미니 퀴즈"
            description="단어 이해를 확인하는 퀴즈 블록을 보여 줍니다."
            checked={settings.showQuiz}
            onChange={(value) => onChange({ ...settings, showQuiz: value })}
          />
        </div>

        {settings.showQuiz && (
          <div className="setting-field">
            <label htmlFor="quizItemLimit">퀴즈 문항 수 (레벨별)</label>
            <input
              id="quizItemLimit"
              type="number"
              min="1"
              max="10"
              value={settings.quizItemLimit}
              onChange={(e) => handleQuizLimitChange(e.target.value)}
            />
            <p className="setting-desc">레벨별로 최대 몇 개의 퀴즈를 노출할지 설정합니다.</p>
          </div>
        )}
      </SettingGroup>
    </aside>
  );
}

function Section({ title, children, collapsible = false, open = true, onToggle }) {
  return (
    <section className={`lex-section ${collapsible ? 'lex-section--collapsible' : ''} ${collapsible && !open ? 'collapsed' : ''}`}>
      <div className="lex-section-header">
        <p className="lex-section-title">{title}</p>
        {collapsible && (
          <button
            type="button"
            className="section-toggle"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={`${title} ${open ? '접기' : '펼치기'}`}
          >
            {open ? '−' : '+'}
          </button>
        )}
      </div>
      {(!collapsible || open) && <div className="lex-section-body">{children}</div>}
    </section>
  );
}

function PillList({ label, items, showMeaning }) {
  if (!items || items.length === 0) return null;
  const renderItem = (item) => {
    if (typeof item === 'string') return item;
    if (item?.word) {
      const meaning = showMeaning && item.meaning_ko ? ` (${item.meaning_ko})` : '';
      return `${item.word}${meaning}`;
    }
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

function MeaningList({ meanings, limit, showKorean }) {
  const limited = useMemo(() => meanings?.slice(0, limit) ?? [], [limit, meanings]);

  if (!limited.length) return <p className="muted">뜻 정보가 없습니다.</p>;

  return (
    <ol className="meaning-list">
      {limited.map((meaning, index) => (
        <li key={`${meaning.definition_en}-${index}`}>
          <span className="badge">{index + 1}</span>
          <div className="meaning-texts">
            <p className="meaning-en">{meaning.definition_en}</p>
            {showKorean && <p className="meaning-ko">{meaning.definition_ko}</p>}
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

function CollocationList({ groups, showKorean }) {
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
                    {showKorean && <span className="collocation-meaning">{item.meaning_ko}</span>}
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

function ExampleList({ examples, showKorean }) {
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
                  {showKorean && <p className="meaning-ko">{item.meaning_ko}</p>}
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

function QuizList({ quiz, showKorean, limitPerLevel, showTitle = true }) {
  if (!quiz || quiz.length === 0) return null;
  return (
    <div className="quiz-list">
      {showTitle && <p className="quiz-title">미니 퀴즈</p>}
      {quiz.map((group) => (
        <div key={group.level} className="quiz-group">
          <p className="level-label">레벨 {group.level}</p>
          <ol>
            {group.items?.length ? (
              group.items.slice(0, limitPerLevel).map((item, index) => (
                <li key={`${item.q}-${index}`}>
                  <p className="quiz-question">{item.q}</p>
                  {showKorean && <p className="meaning-note">{item.meaning_ko}</p>}
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

function filterByLevel(groups, levels) {
  if (!groups?.length) return [];
  if (!levels?.length) return groups;
  return groups.filter((group) => levels.includes(group.level));
}

function LexiconEntry({ entry, settings }) {
  const [openSections, setOpenSections] = useState({
    core: false,
    context: false,
    grammar: false,
    resources: false,
    quiz: false,
  });

  const availableLevels = useMemo(() => {
    const levelSet = new Set(['상', '중', '하']);
    [entry.collocations, entry.examples, entry.quiz].forEach((groups) => {
      groups?.forEach((group) => {
        if (group.level) levelSet.add(group.level);
      });
    });
    return Array.from(levelSet);
  }, [entry]);

  const levelsToShow = settings.levelMode === 'custom' && settings.selectedLevels.length
    ? settings.selectedLevels
    : availableLevels;

  const filteredCollocations = filterByLevel(entry.collocations, levelsToShow);
  const filteredExamples = filterByLevel(entry.examples, levelsToShow);
  const filteredQuiz = filterByLevel(entry.quiz, levelsToShow);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

      <div className="lex-card-hero">
        {settings.showClassification && (
          <div className="quick-meta" aria-label="단어 메타 정보">
            {(entry.frequency || entry.difficulty) && (
              <div className="fact-row">
                {entry.frequency && (
                  <div className="fact">
                    <span className="fact-label">빈도</span>
                    <span className="fact-value">{entry.frequency}</span>
                  </div>
                )}
                {entry.difficulty && (
                  <div className="fact">
                    <span className="fact-label">난이도</span>
                    <span className="fact-value">Lv.{entry.difficulty}</span>
                  </div>
                )}
              </div>
            )}

            {entry.tags?.length ? (
              <div className="fact">
                <span className="fact-label">태그/분야</span>
                <div className="fact-badges">
                  {entry.tags.map((tag, index) => (
                    <span className="chip ghost" key={`${tag}-${index}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {entry.nuanceRegister && (
              <div className="fact subtle">
                <span className="fact-label">뉘앙스 · 레지스터</span>
                <p className="meaning-note">{entry.nuanceRegister}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Section
        title="핵심 개념 · 주요 뜻 · 단어 관계"
        collapsible
        open={openSections.core}
        onToggle={() => toggleSection('core')}
      >
        <div className="meaning-stack">
          {settings.showConcept && entry.concept && (
            <div className="concept-block concept-block--compact">
              <p className="eyebrow">핵심 개념</p>
              <p className="concept concept--compact">{entry.concept}</p>
            </div>
          )}

          <div className="meaning-column">
            <p className="label">주요 뜻</p>
            <MeaningList meanings={entry.meanings} limit={settings.meaningLimit} showKorean={settings.showKoreanMeanings} />
          </div>

          {settings.showRelations && (
            <div className="relation-column">
              <p className="label">단어 관계</p>
              <div className="relation-stack">
                <PillList label="파생어" items={entry.derivatives} showMeaning={settings.showKoreanMeanings} />
                <PillList label="관련어" items={entry.related} showMeaning={settings.showKoreanMeanings} />
                <PillList label="동의어" items={entry.synonyms} showMeaning={settings.showKoreanMeanings} />
                <PillList label="유사어" items={entry.nearSynonyms} showMeaning={settings.showKoreanMeanings} />
                <PillList label="반의어" items={entry.antonyms} showMeaning={settings.showKoreanMeanings} />
              </div>
            </div>
          )}
        </div>
      </Section>

      {settings.showUsageContext && (
        <Section
          title="사용 맥락 & 뉘앙스"
          collapsible
          open={openSections.context}
          onToggle={() => toggleSection('context')}
        >
          <div className="context-grid">
            <div>
              <p className="label">의미 확장</p>
              <p className="body-text">{entry.semanticExtension || '의미 확장 정보 없음'}</p>
            </div>
            <div>
              <p className="label">추가 노트</p>
              {entry.studyTips ? <p className="body-text">{entry.studyTips}</p> : <p className="muted">추가 학습 노트가 없습니다.</p>}
            </div>
          </div>
        </Section>
      )}

      {settings.showFormDetails && (
        <Section
          title="형태 · 전치사 패턴 · 문법"
          collapsible
          open={openSections.grammar}
          onToggle={() => toggleSection('grammar')}
        >
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
      )}

      {(settings.showCollocations || settings.showExamples) && (
        <Section
          title="콜로케이션 · 예문"
          collapsible
          open={openSections.resources}
          onToggle={() => toggleSection('resources')}
        >
          {settings.showCollocations && <CollocationList groups={filteredCollocations} showKorean={settings.showKoreanMeanings} />}
          {settings.showExamples && <ExampleList examples={filteredExamples} showKorean={settings.showKoreanMeanings} />}
          {!filteredCollocations.length && !filteredExamples.length && (
            <p className="muted">선택한 레벨에 해당하는 예시가 없습니다.</p>
          )}
        </Section>
      )}

      {settings.showQuiz && (
        <Section
          title="미니 퀴즈"
          collapsible
          open={openSections.quiz}
          onToggle={() => toggleSection('quiz')}
        >
          <QuizList
            quiz={filteredQuiz}
            showKorean={settings.showKoreanMeanings}
            limitPerLevel={settings.quizItemLimit}
            showTitle={false}
          />
        </Section>
      )}
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
        const combinedEntries = loadWordEntries();

        if (combinedEntries.length) {
          setEntries(combinedEntries);
          return;
        }

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
        <div className="topbar-title">
          <p className="eyebrow">Lexicon Lab</p>
          <h1>단어 카드</h1>
        </div>
        <div className="top-actions">
          <button className="panel-toggle" type="button" onClick={() => setPanelOpen((v) => !v)} aria-label="설정 열기">
            <span className="toggle-icon">⚙</span>
            <span>맞춤 설정</span>
          </button>
        </div>
      </header>

      {loading && <p className="status">목록을 불러오는 중입니다...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && entries.length === 0 && <p className="status">단어 데이터가 없습니다.</p>}

      {entries.map((entry) => (
        <LexiconEntry key={entry.word} entry={entry} settings={settings} />
      ))}

      <SettingsPanel
        open={panelOpen}
        settings={settings}
        levelOptions={entries
          .flatMap((entry) => [...(entry.collocations || []), ...(entry.examples || []), ...(entry.quiz || [])])
          .map((group) => group.level)
          .filter(Boolean)}
        onChange={setSettings}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
}
