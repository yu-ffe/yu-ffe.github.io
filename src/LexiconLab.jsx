import { useEffect, useMemo, useState } from 'react';
import './LexiconLab.css';

const SETTINGS_COOKIE = 'lexiconLabSettings';
const POSITION_COOKIE = 'lexiconLabPosition';
// TODO: Remove MOBILE_PREVIEW once desktop view is restored.
const MOBILE_PREVIEW = true;

const wordSources = import.meta.glob('../public/assets/words/json/**/*.json', { eager: true });

const wordSourceOptions = Array.from(
  new Set(
    Object.keys(wordSources)
      .map((path) => path.match(/\/words\/json\/([^/]+)\//)?.[1])
      .filter(Boolean)
  )
).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const wordSourceLabels = {
  Transfer: 'Transfer · 편입',
  CSAT: 'CSAT · 수능',
};

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
  showStickyWord: true,
  showStickyPos: true,
  blurQuizAnswers: true,
  quizBlurAmount: 8,
  levelMode: 'all',
  selectedLevels: ['상', '중', '하'],
  quizItemLimit: 3,
  wordSource: 'all',
  studyModules: [
    'preposition',
    'naturalness',
    'contextMeaning',
    'sentenceTranslation',
    'meaningRecall',
    'wrongCollocation',
    'sentenceRewrite',
  ],
  studyQuestionCount: 6,
};

const STUDY_MODULES = [
  {
    key: 'preposition',
    title: '전치사 · 보어 채우기',
    description: '전치사/보어가 빠진 표현에서 맞는 형태를 고릅니다.',
  },
  {
    key: 'naturalness',
    title: '문장 사용 자연성 판단 (O/X)',
    description: '문장을 보고 자연스러운지(O) 어색한지(X)를 판단합니다.',
  },
  {
    key: 'contextMeaning',
    title: '문맥 기반 의미 판단',
    description: '문맥 속 의미를 고르는 다의어 구분 훈련입니다.',
  },
  {
    key: 'sentenceTranslation',
    title: '문장 해석 (뜻 블러)',
    description: '영문만 보고 먼저 해석한 뒤 뜻을 확인합니다.',
  },
  {
    key: 'meaningRecall',
    title: '뜻 → 단어 회상',
    description: '뜻을 보고 해당 영어 단어를 떠올립니다.',
  },
  {
    key: 'wrongCollocation',
    title: '잘못된 결합 찾기',
    description: '그럴듯하지만 틀린 결합을 골라냅니다.',
  },
  {
    key: 'sentenceRewrite',
    title: '문장 재작성 (지정 단어 사용)',
    description: '지정 단어를 활용해 문장을 다시 씁니다.',
  },
];

const PREPOSITION_POOL = ['to', 'for', 'with', 'on', 'in', 'at', 'from', 'into', 'by', 'about', 'against'];

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

function getWordSourceKey(path) {
  return path.match(/\/words\/json\/([^/]+)\//)?.[1] ?? '';
}

function getWordSourceLabel(source) {
  return wordSourceLabels[source] ?? source;
}

function loadWordEntries(sourceFilter) {
  const modules = Object.entries(wordSources)
    .filter(([path]) => sourceFilter === 'all' || getWordSourceKey(path) === sourceFilter)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));

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

function shuffleArray(items) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildStudyQuestions(entries, selectedModules, questionLimit) {
  const meaningPool = entries
    .flatMap((entry) => entry.meanings || [])
    .map((meaning) => meaning.definition_ko)
    .filter(Boolean);

  const questionMap = Object.fromEntries(selectedModules.map((key) => [key, []]));

  const addQuestion = (moduleKey, question) => {
    if (!questionMap[moduleKey]) return;
    questionMap[moduleKey].push(question);
  };

  entries.forEach((entry) => {
    const examples = (entry.examples || []).flatMap((group) => group.items || []);
    const meanings = entry.meanings || [];
    const requiredComplements = entry.requiredComplements || [];
    const grammarNotes = entry.grammarNotes || '';
    const prepositionPatterns = entry.prepositionPatterns || [];
    const collocationItems = (entry.collocations || []).flatMap((group) => group.items || []);

    if (selectedModules.includes('preposition')) {
      prepositionPatterns.forEach((pattern, index) => {
        const prep = pattern.prep?.trim();
        if (!prep) return;
        const example = pattern.example || '';
        const prompt = example
          ? example.replace(new RegExp(`\\b${escapeRegExp(prep)}\\b`, 'i'), '___')
          : `${entry.word} ___`;
        addQuestion('preposition', {
          id: `${entry.word}-preposition-${index}`,
          type: 'fill',
          prompt,
          answer: prep,
          hint: pattern.meaning_ko || requiredComplements[0] || '',
        });
      });
    }

    if (selectedModules.includes('naturalness')) {
      examples.forEach((example, index) => {
        if (!example?.sentence) return;
        addQuestion('naturalness', {
          id: `${entry.word}-natural-${index}`,
          type: 'ox',
          prompt: '다음 문장이 자연스러우면 O, 어색하면 X를 고르세요.',
          sentence: example.sentence,
          answer: 'O',
          hint: grammarNotes || requiredComplements[0] || '',
        });

        const prepCandidates = prepositionPatterns.map((pattern) => pattern.prep).filter(Boolean);
        const prepList = prepCandidates.length ? prepCandidates : PREPOSITION_POOL;
        const targetPrep = prepList.find((prep) =>
          new RegExp(`\\b${escapeRegExp(prep)}\\b`, 'i').test(example.sentence)
        );
        if (targetPrep) {
          const wrongPrepOptions = PREPOSITION_POOL.filter((prep) => prep !== targetPrep);
          const wrongPrep = wrongPrepOptions[Math.floor(Math.random() * wrongPrepOptions.length)];
          const corrupted = example.sentence.replace(
            new RegExp(`\\b${escapeRegExp(targetPrep)}\\b`, 'i'),
            wrongPrep
          );
          addQuestion('naturalness', {
            id: `${entry.word}-natural-x-${index}`,
            type: 'ox',
            prompt: '다음 문장이 자연스러우면 O, 어색하면 X를 고르세요.',
            sentence: corrupted,
            answer: 'X',
            hint: requiredComplements[0] || '',
          });
        }
      });
    }

    if (selectedModules.includes('contextMeaning')) {
      examples.forEach((example, index) => {
        if (!example?.sentence || meanings.length === 0) return;
        const correct = meanings[0]?.definition_ko;
        if (!correct) return;
        const wrongOptions = shuffleArray(
          meaningPool.filter((meaning) => meaning && meaning !== correct)
        ).slice(0, 2);
        const options = shuffleArray([correct, ...wrongOptions]);
        addQuestion('contextMeaning', {
          id: `${entry.word}-context-${index}`,
          type: 'multi',
          prompt: '다음 문장에서 해당 단어의 의미로 알맞은 것은?',
          sentence: example.sentence,
          options,
          answer: correct,
        });
      });
    }

    if (selectedModules.includes('sentenceTranslation')) {
      examples.forEach((example, index) => {
        if (!example?.sentence || !example.meaning_ko) return;
        addQuestion('sentenceTranslation', {
          id: `${entry.word}-translation-${index}`,
          type: 'reveal',
          prompt: '문장을 먼저 해석해 보세요.',
          sentence: example.sentence,
          answer: example.meaning_ko,
          blurAnswer: true,
        });
      });
    }

    if (selectedModules.includes('meaningRecall')) {
      meanings.forEach((meaning, index) => {
        if (!meaning.definition_ko) return;
        addQuestion('meaningRecall', {
          id: `${entry.word}-recall-${index}`,
          type: 'reveal',
          prompt: `뜻: ${meaning.definition_ko}`,
          answer: entry.word,
          hint: meaning.note || '',
        });
      });
    }

    if (selectedModules.includes('wrongCollocation')) {
      const patternOptions = prepositionPatterns
        .map((pattern) => pattern.prep)
        .filter(Boolean)
        .map((prep) => `${entry.word} ${prep}`);
      const collocationOptions = collocationItems
        .map((item) => item.phrase)
        .filter(Boolean);
      const correctOptions = Array.from(new Set([...patternOptions, ...collocationOptions]));
      if (correctOptions.length >= 2) {
        const wrongPrepOptions = PREPOSITION_POOL.filter(
          (prep) => !prepositionPatterns.some((pattern) => pattern.prep === prep)
        );
        const wrongPrep = wrongPrepOptions[Math.floor(Math.random() * wrongPrepOptions.length)] || 'to';
        const wrongOption = `${entry.word} ${wrongPrep}`;
        const picks = shuffleArray(correctOptions).slice(0, 2);
        const options = shuffleArray([...picks, wrongOption]);
        addQuestion('wrongCollocation', {
          id: `${entry.word}-wrong-${entry.word}`,
          type: 'multi',
          prompt: '다음 중 틀린 결합을 고르세요.',
          options,
          answer: wrongOption,
        });
      }
    }

    if (selectedModules.includes('sentenceRewrite')) {
      examples.forEach((example, index) => {
        if (!example?.sentence) return;
        const regex = new RegExp(`\\b${escapeRegExp(entry.word)}\\b`, 'i');
        if (!regex.test(example.sentence)) return;
        const blanked = example.sentence.replace(regex, '_____');
        addQuestion('sentenceRewrite', {
          id: `${entry.word}-rewrite-${index}`,
          type: 'reveal',
          prompt: `${entry.word}를 사용해 문장을 다시 써 보세요.`,
          sentence: blanked,
          answer: example.sentence,
          hint: requiredComplements[0] || '',
        });
      });
    }
  });

  const limitedQuestions = Object.fromEntries(
    Object.entries(questionMap).map(([key, list]) => [key, shuffleArray(list).slice(0, questionLimit)])
  );

  return limitedQuestions;
}

function SettingsPanel({ open, settings, onChange, onClose, levelOptions, wordSourceOptions: sources }) {
  const safeLevels = levelOptions?.length ? Array.from(new Set(levelOptions)) : ['상', '중', '하'];
  const safeSources = sources?.length ? sources : [];

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

        <div className="settings-grid">
          <SettingToggle
            label="섹션 단어 고정 표시"
            description="스크롤 중에도 좌측 상단에 현재 단어를 고정 노출합니다."
            checked={settings.showStickyWord}
            onChange={(value) => onChange({ ...settings, showStickyWord: value })}
          />
          <SettingToggle
            label="품사 함께 표시"
            description="고정 단어 표시 옆에 품사를 함께 보여 줍니다."
            checked={settings.showStickyPos}
            onChange={(value) => onChange({ ...settings, showStickyPos: value })}
          />
        </div>
      </SettingGroup>

      {safeSources.length > 0 && (
        <SettingGroup title="자료 선택" description="표시할 단어장 폴더를 선택하세요.">
          <div className="radio-row">
            <label>
              <input
                type="radio"
                name="wordSource"
                value="all"
                checked={settings.wordSource === 'all'}
                onChange={(e) => onChange({ ...settings, wordSource: e.target.value })}
              />
              전체
            </label>
            {safeSources.map((source) => (
              <label key={source}>
                <input
                  type="radio"
                  name="wordSource"
                  value={source}
                  checked={settings.wordSource === source}
                  onChange={(e) => onChange({ ...settings, wordSource: e.target.value })}
                />
                {getWordSourceLabel(source)}
              </label>
            ))}
          </div>
          <p className="setting-desc">선택한 폴더 내부 JSON을 모두 불러옵니다.</p>
        </SettingGroup>
      )}

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

      <SettingGroup
        title="맞춤 학습 모듈"
        description="Lexicon Lab 데이터를 기반으로 문제 유형을 선택하고 학습할 수 있습니다."
      >
        <div className="settings-grid">
          {STUDY_MODULES.map((module) => (
            <SettingToggle
              key={module.key}
              label={module.title}
              description={module.description}
              checked={settings.studyModules.includes(module.key)}
              onChange={(value) => {
                const next = value
                  ? [...settings.studyModules, module.key]
                  : settings.studyModules.filter((key) => key !== module.key);
                onChange({ ...settings, studyModules: next });
              }}
            />
          ))}
        </div>
        <div className="setting-field">
          <label htmlFor="studyQuestionCount">모듈별 문항 수</label>
          <input
            id="studyQuestionCount"
            type="number"
            min="3"
            max="12"
            value={settings.studyQuestionCount}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              const safeValue = Number.isNaN(nextValue) ? 6 : Math.min(12, Math.max(3, nextValue));
              onChange({ ...settings, studyQuestionCount: safeValue });
            }}
          />
          <p className="setting-desc">선택한 모듈마다 최대 N개의 문제를 랜덤으로 제공합니다.</p>
        </div>
      </SettingGroup>

      <SettingGroup title="퀴즈 정답 블러" description="정답을 바로 보지 않도록 흐림 처리 옵션을 제공합니다.">
        <SettingToggle
          label="정답 흐림 처리"
          description="정답 버튼을 클릭해야 선명하게 볼 수 있습니다."
          checked={settings.blurQuizAnswers}
          onChange={(value) => onChange({ ...settings, blurQuizAnswers: value })}
        />
        {settings.blurQuizAnswers && (
          <div className="setting-field">
            <label htmlFor="quizBlurAmount">블러 강도</label>
            <input
              id="quizBlurAmount"
              type="range"
              min="2"
              max="14"
              value={settings.quizBlurAmount}
              onChange={(e) => onChange({ ...settings, quizBlurAmount: Number(e.target.value) })}
            />
            <p className="setting-desc">숫자가 높을수록 정답이 더 흐려집니다.</p>
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

function QuizAnswer({ text, blurred, blurAmount }) {
  const [revealed, setRevealed] = useState(false);

  if (!blurred) {
    return <span className="choice answer">{text}</span>;
  }

  const handleClick = () => setRevealed(true);

  return (
    <button
      type="button"
      className={`choice answer quiz-answer ${revealed ? 'revealed' : 'blurred'}`}
      style={{ '--blur-amount': `${blurAmount}px` }}
      onClick={handleClick}
      aria-pressed={revealed}
      aria-label={revealed ? '정답이 표시되었습니다' : '정답 보기'}
      title={revealed ? '정답 표시됨' : '클릭해서 정답 보기'}
    >
      {text}
    </button>
  );
}

function QuizList({ quiz, showKorean, limitPerLevel, showTitle = true, blurAnswers, blurAmount }) {
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
                    <QuizAnswer text={item.a} blurred={blurAnswers} blurAmount={blurAmount} />
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

function StudyQuestion({ item }) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleOptionClick = (option) => {
    setSelected(option);
    setRevealed(true);
  };

  const showAnswer = revealed || (item.options && selected);
  const answerText = item.answer || '';

  return (
    <li className="study-question">
      <p className="question-prompt">{item.prompt}</p>
      {item.sentence && <p className="question-sentence">{item.sentence}</p>}
      {item.options && (
        <div className="question-options">
          {item.options.map((option) => {
            const isSelected = selected === option;
            const isCorrect = showAnswer && option === item.answer;
            return (
              <button
                key={option}
                type="button"
                className={`question-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''}`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
      {item.type === 'ox' && (
        <div className="question-options">
          {['O', 'X'].map((option) => {
            const isSelected = selected === option;
            const isCorrect = showAnswer && option === item.answer;
            return (
              <button
                key={option}
                type="button"
                className={`question-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''}`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
      {item.hint && <p className="question-hint">힌트: {item.hint}</p>}
      {answerText && (
        <div
          className={`question-answer ${
            showAnswer ? 'revealed' : item.blurAnswer ? 'blurred' : 'hidden'
          }`}
        >
          <span className="answer-label">정답</span>
          <span className="answer-text">{answerText}</span>
        </div>
      )}
      {!showAnswer && (
        <button type="button" className="answer-toggle" onClick={() => setRevealed(true)}>
          정답 보기
        </button>
      )}
    </li>
  );
}

function StudyModuleBoard({ questions, onShuffle }) {
  const selectedModules = STUDY_MODULES.filter((module) => questions[module.key]?.length);

  return (
    <section className="study-board">
      <header className="study-board-header">
        <div>
          <p className="eyebrow">맞춤 학습</p>
          <h2>Lexicon Lab 연계 모듈</h2>
          <p className="study-desc">선택한 모듈 기준으로 단어 문제를 랜덤 제공해 학습할 수 있습니다.</p>
        </div>
        <button type="button" className="ghost" onClick={onShuffle}>
          문제 다시 섞기
        </button>
      </header>

      {selectedModules.length === 0 ? (
        <div className="study-empty">
          <p>맞춤 설정에서 학습 모듈을 선택하면 문제가 표시됩니다.</p>
        </div>
      ) : (
        <div className="study-grid">
          {selectedModules.map((module) => (
            <article key={module.key} className="study-module-card">
              <div className="study-module-header">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
              <ol className="study-questions">
                {questions[module.key].map((item) => (
                  <StudyQuestion key={item.id} item={item} />
                ))}
              </ol>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function PaginationControls({ currentPage, totalPages, onChange, pageSize, onPageSizeChange, totalItems }) {
  if (!totalItems) return null;

  const handleSelectChange = (event) => {
    const next = Number(event.target.value);
    onPageSizeChange(Number.isNaN(next) ? 8 : next);
  };

  return (
    <div className="pagination-bar" aria-label="카드 페이지 전환">
      <div className="pagination-meta">
        <p className="eyebrow">총 {totalItems}개 단어</p>
        <p className="pagination-range">
          페이지 {currentPage} / {totalPages}
        </p>
      </div>
      <div className="pagination-actions">
        <label className="page-size" htmlFor="pageSize">
          페이지당
          <select id="pageSize" value={pageSize} onChange={handleSelectChange}>
            {[6, 8, 10, 12].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          개
        </label>
        <div className="page-buttons">
          <button
            type="button"
            className="page-button"
            onClick={() => onChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
          >
            ← 이전
          </button>
          <button
            type="button"
            className="page-button"
            onClick={() => onChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
          >
            다음 →
          </button>
        </div>
      </div>
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

      {settings.showStickyWord && (
        <div className="lex-card-sticky">
          <span className="sticky-word">{entry.word}</span>
          {settings.showStickyPos && (
            <span className="sticky-pos">
              {Array.isArray(entry.partOfSpeech) ? entry.partOfSpeech.join(' / ') : entry.partOfSpeech}
            </span>
          )}
        </div>
      )}

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
            blurAnswers={settings.blurQuizAnswers}
            blurAmount={settings.quizBlurAmount}
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const handleWordSourceChange = (nextSource) => {
    setSettings((prev) => ({ ...prev, wordSource: nextSource }));
  };

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
        const combinedEntries = loadWordEntries(settings.wordSource);

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
  }, [settings.wordSource]);

  useEffect(() => {
    if (!entries.length) return;
    const saved = Number(readCookie(POSITION_COOKIE));
    if (!Number.isNaN(saved) && saved > 0) {
      window.scrollTo({ top: saved, behavior: 'smooth' });
    }
  }, [entries]);

  useEffect(() => {
    setCurrentPage(1);
  }, [entries, pageSize]);

  const studyQuestions = useMemo(
    () => buildStudyQuestions(entries, settings.studyModules, settings.studyQuestionCount),
    [entries, settings.studyModules, settings.studyQuestionCount, shuffleSeed]
  );

  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const visibleEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return entries.slice(start, start + pageSize);
  }, [currentPage, entries, pageSize]);

  const handlePageChange = (nextPage) => {
    const page = Math.min(Math.max(nextPage, 1), totalPages);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShuffle = () => {
    setShuffleSeed((prev) => prev + 1);
  };

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
          {wordSourceOptions.length > 0 && (
            <div className="source-selector" role="group" aria-label="단어장 선택">
              <span className="source-label">단어장</span>
              <div className="source-buttons">
                <button
                  type="button"
                  className={`source-chip ${settings.wordSource === 'all' ? 'active' : ''}`}
                  onClick={() => handleWordSourceChange('all')}
                >
                  전체
                </button>
                {wordSourceOptions.map((source) => (
                  <button
                    key={source}
                    type="button"
                    className={`source-chip ${settings.wordSource === source ? 'active' : ''}`}
                    onClick={() => handleWordSourceChange(source)}
                  >
                    {getWordSourceLabel(source)}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button className="panel-toggle" type="button" onClick={() => setPanelOpen((v) => !v)} aria-label="설정 열기">
            <span className="toggle-icon">⚙</span>
            <span>맞춤 설정</span>
          </button>
        </div>
      </header>

      {loading && <p className="status">목록을 불러오는 중입니다...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && entries.length === 0 && <p className="status">단어 데이터가 없습니다.</p>}

      {!loading && !error && (
        <StudyModuleBoard
          questions={studyQuestions}
          onShuffle={handleShuffle}
        />
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onChange={handlePageChange}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalItems={entries.length}
      />

      {visibleEntries.map((entry) => (
        <LexiconEntry key={entry.word} entry={entry} settings={settings} />
      ))}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onChange={handlePageChange}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalItems={entries.length}
      />

      <SettingsPanel
        open={panelOpen}
        settings={settings}
        levelOptions={entries
          .flatMap((entry) => [...(entry.collocations || []), ...(entry.examples || []), ...(entry.quiz || [])])
          .map((group) => group.level)
          .filter(Boolean)}
        wordSourceOptions={wordSourceOptions}
        onChange={setSettings}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
}
