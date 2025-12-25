import { useEffect, useMemo, useState } from 'react';
import './LexiconLab.css';

const SETTINGS_COOKIE = 'lexiconLabSettings';
const POSITION_COOKIE = 'lexiconLabPosition';
const VIEW_COOKIE = 'lexiconLabView';
const PRESET_COOKIE = 'lexiconLabPreset';
const CUSTOM_PRESET_COOKIE = 'lexiconLabCustomPresets';
const MAX_CUSTOM_PRESETS = 3;
// TODO: Remove MOBILE_PREVIEW once desktop view is restored.
const MOBILE_PREVIEW = true;
const CHUNK_SIZE = 100;
const PAGE_SIZE_OPTIONS = [6, 8, 10, 12];
const LEVEL_COLORS = {
  상: '#ef4444',
  중: '#f97316',
  하: '#facc15',
};
const DEFAULT_LEVEL_COLOR = '#9db7ff';

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
  showWordSection: true,
  showPracticeSection: true,
  practiceItemLimit: 8,
  selectedPracticeModules: [
    'preposition',
    'naturalness',
    'contextMeaning',
    'sentenceTranslation',
    'meaningRecall',
    'wrongCombination',
    'rewrite',
  ],
};

const presetOptions = [
  {
    key: 'minimal',
    label: '1. 단어-뜻만',
    description: '단어와 핵심 뜻만 빠르게 보고 싶을 때',
    settings: {
      showConcept: false,
      meaningLimit: 1,
      showClassification: false,
      showRelations: false,
      showUsageContext: false,
      showFormDetails: false,
      showCollocations: false,
      showExamples: false,
      showQuiz: false,
      showWordSection: true,
      showPracticeSection: false,
      blurQuizAnswers: false,
    },
    selectedPracticeModules: [],
  },
  {
    key: 'study-core',
    label: '2. 핵심 공부용',
    description: '필수 정보와 핵심 예시만 남긴 버전',
    settings: {
      showConcept: true,
      meaningLimit: 3,
      showClassification: true,
      showRelations: true,
      showUsageContext: false,
      showFormDetails: true,
      showCollocations: true,
      showExamples: true,
      showQuiz: true,
      showWordSection: true,
      showPracticeSection: true,
      blurQuizAnswers: false,
    },
    selectedPracticeModules: ['meaningRecall', 'sentenceTranslation', 'preposition', 'contextMeaning'],
  },
  {
    key: 'study-plus',
    label: '3. 확장 공부용',
    description: '조금 더 많은 학습 정보를 포함',
    settings: {
      showConcept: true,
      meaningLimit: 4,
      showClassification: true,
      showRelations: true,
      showUsageContext: true,
      showFormDetails: true,
      showCollocations: true,
      showExamples: true,
      showQuiz: true,
      showWordSection: true,
      showPracticeSection: true,
      blurQuizAnswers: true,
    },
    selectedPracticeModules: ['meaningRecall', 'sentenceTranslation', 'preposition', 'contextMeaning', 'naturalness', 'wrongCombination'],
  },
  {
    key: 'full',
    label: '4. 전체 보기',
    description: '모든 항목을 한 번에 확인',
    settings: {
      showConcept: true,
      meaningLimit: 6,
      showClassification: true,
      showRelations: true,
      showUsageContext: true,
      showFormDetails: true,
      showCollocations: true,
      showExamples: true,
      showQuiz: true,
      showWordSection: true,
      showPracticeSection: true,
      blurQuizAnswers: true,
    },
    selectedPracticeModules: defaultSettings.selectedPracticeModules,
  },
];

const practiceModules = [
  {
    key: 'preposition',
    label: '전치사 / 보어 채우기',
    description: '전치사·보어 빈칸을 채우는 문제를 만듭니다.',
  },
  {
    key: 'naturalness',
    label: '문장 자연성 판단 (O / X)',
    description: '예문이 자연스러운지 판단하는 문제를 만듭니다.',
  },
  {
    key: 'contextMeaning',
    label: '문맥 기반 의미 판단',
    description: '문맥에 맞는 의미를 고르는 문제를 만듭니다.',
  },
  {
    key: 'sentenceTranslation',
    label: '문장 해석 (뜻 블러 처리)',
    description: '영문만 보고 해석을 떠올리는 문제를 만듭니다.',
  },
  {
    key: 'meaningRecall',
    label: '뜻 → 단어 회상',
    description: '한국어 뜻을 보고 단어를 회상하는 문제를 만듭니다.',
  },
  {
    key: 'wrongCombination',
    label: '잘못된 결합 찾기',
    description: '전치사/구문 결합 중 틀린 것을 찾는 문제를 만듭니다.',
  },
  {
    key: 'rewrite',
    label: '문장 재작성 (지정 단어 사용)',
    description: '지정 단어를 사용해 문장을 다시 쓰는 문제를 만듭니다.',
  },
];

function readCookie(name) {
  if (typeof document === 'undefined') return '';
  const value = document.cookie
    .split('; ')
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.split('=')[1]) : '';
}

function readJsonCookie(name, fallback = null) {
  const raw = readCookie(name);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (err) {
    const numeric = Number(raw);
    if (!Number.isNaN(numeric)) return numeric;
    console.warn(`${name} 쿠키를 JSON으로 해석하지 못했습니다.`, err);
    return fallback;
  }
}

function writeCookie(name, value, days = 90) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function normalizeCustomPresets(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_CUSTOM_PRESETS).map((preset, index) => ({
    key: preset?.key || `custom-${index}`,
    label: preset?.label || `커스텀 ${index + 1}`,
    settings: preset?.settings || defaultSettings,
    selectedPracticeModules: preset?.selectedPracticeModules || preset?.settings?.selectedPracticeModules,
  }));
}

function getWordSourceKey(path) {
  return path.match(/\/words\/json\/([^/]+)\//)?.[1] ?? '';
}

function getWordSourceLabel(source) {
  return wordSourceLabels[source] ?? source;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizePageSize(value) {
  const parsed = Number(value);
  if (PAGE_SIZE_OPTIONS.includes(parsed)) return parsed;
  return PAGE_SIZE_OPTIONS[0];
}

function loadInitialSettings() {
  const saved = readJsonCookie(SETTINGS_COOKIE, {});
  const merged = {
    ...defaultSettings,
    ...(saved && typeof saved === 'object' ? saved : {}),
  };

  merged.meaningLimit = clamp(Number(merged.meaningLimit) || defaultSettings.meaningLimit, 1, 10);
  merged.quizItemLimit = clamp(Number(merged.quizItemLimit) || defaultSettings.quizItemLimit, 1, 10);
  merged.practiceItemLimit = clamp(
    Number(merged.practiceItemLimit) || defaultSettings.practiceItemLimit,
    3,
    20
  );
  merged.wordSource = merged.wordSource || defaultSettings.wordSource;
  merged.selectedLevels = merged.selectedLevels?.length ? merged.selectedLevels : [...defaultSettings.selectedLevels];
  merged.selectedPracticeModules = Array.isArray(merged.selectedPracticeModules) && merged.selectedPracticeModules.length
    ? merged.selectedPracticeModules
    : [...defaultSettings.selectedPracticeModules];

  return merged;
}

function loadInitialViewState() {
  const viewState = readJsonCookie(VIEW_COOKIE, {}) || {};
  const positionState = readJsonCookie(POSITION_COOKIE, {}) || {};
  const combined = { ...viewState, ...positionState };

  const viewMode = combined.viewMode === 'practice' ? 'practice' : 'words';
  const chunkIndex = Number.isInteger(combined.chunkIndex) ? Math.max(0, combined.chunkIndex) : 0;
  const page = Number.isInteger(combined.page) ? Math.max(1, combined.page) : 1;
  const pageSize = normalizePageSize(combined.pageSize);
  const savedLocation =
    combined && typeof combined === 'object' && Object.keys(combined).length > 0 ? combined : null;

  return { viewMode, chunkIndex, page, pageSize, savedLocation };
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

function SettingsPanel({
  open,
  settings,
  onChange,
  onClose,
  levelOptions,
  wordSourceOptions: sources,
  activePreset,
  onPresetApply,
  customPresets,
  onSaveCustomPreset,
  onApplyCustomPreset,
}) {
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

      <SettingGroup title="프리셋" description="원클릭으로 보기/문제 구성을 전환합니다.">
        <div className="preset-list">
          {presetOptions.map((preset) => (
            <button
              key={preset.key}
              type="button"
              className={`preset-chip ${activePreset === preset.key ? 'active' : ''}`}
              onClick={() => onPresetApply(preset.key)}
            >
              <span className="preset-label">{preset.label}</span>
              <span className="preset-desc">{preset.description}</span>
            </button>
          ))}
        </div>

        <div className="custom-presets">
          {Array.from({ length: MAX_CUSTOM_PRESETS }).map((_, index) => {
            const saved = customPresets?.[index];
            return (
              <div key={`custom-${index}`} className="custom-slot">
                <div className="slot-meta">
                  <p className="slot-title">{saved?.label || `5. 커스텀 ${index + 1}`}</p>
                  <p className="slot-desc">{saved ? '저장된 설정을 불러올 수 있습니다.' : '지금 설정을 저장해 두세요.'}</p>
                </div>
                <div className="slot-actions">
                  <button type="button" className="ghost" disabled={!saved} onClick={() => onApplyCustomPreset(index)}>
                    불러오기
                  </button>
                  <button type="button" className="ghost" onClick={() => onSaveCustomPreset(index)}>
                    현재 설정 저장
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SettingGroup>

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

      <SettingGroup title="학습 섹션" description="단어 보기와 문제 모드 노출 여부를 제어합니다.">
        <div className="settings-grid">
          <SettingToggle
            label="단어 보기 섹션"
            description="단어 카드 목록을 보여 줍니다."
            checked={settings.showWordSection}
            onChange={(value) => onChange({ ...settings, showWordSection: value })}
          />
          <SettingToggle
            label="문제 모드 섹션"
            description="선택한 모듈로 문제를 섞어 보여 줍니다."
            checked={settings.showPracticeSection}
            onChange={(value) => onChange({ ...settings, showPracticeSection: value })}
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

      <SettingGroup title="문제 모듈 선택" description="선택한 모듈을 섞어서 랜덤 문제를 제공합니다.">
        <div className="settings-grid">
          {practiceModules.map((module) => (
            <SettingToggle
              key={module.key}
              label={module.label}
              description={module.description}
              checked={settings.selectedPracticeModules.includes(module.key)}
              onChange={(value) => {
                const next = value
                  ? Array.from(new Set([...settings.selectedPracticeModules, module.key]))
                  : settings.selectedPracticeModules.filter((item) => item !== module.key);
                onChange({ ...settings, selectedPracticeModules: next });
              }}
            />
          ))}
        </div>
        <div className="setting-field">
          <label htmlFor="practiceItemLimit">문제 노출 개수</label>
          <input
            id="practiceItemLimit"
            type="number"
            min="3"
            max="20"
            value={settings.practiceItemLimit}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              const nextValue = Number.isNaN(parsed) ? 6 : Math.min(20, Math.max(3, parsed));
              onChange({ ...settings, practiceItemLimit: nextValue });
            }}
          />
          <p className="setting-desc">선택한 모듈을 섞어서 최대 N개 문제를 보여 줍니다.</p>
        </div>
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

function LevelIndicator({ level, labelPrefix }) {
  const color = LEVEL_COLORS[level] || DEFAULT_LEVEL_COLOR;
  const announce = `${labelPrefix || '레벨'} ${level}`;

  return (
    <div className="level-indicator" aria-label={announce}>
      <span className="sr-only">{announce}</span>
      <span className="level-bar" style={{ '--level-color': color }} aria-hidden="true" />
      <span className="level-bar" style={{ '--level-color': color }} aria-hidden="true" />
    </div>
  );
}

function CollocationList({ groups, showKorean }) {
  if (!groups || groups.length === 0) return <p className="muted">콜로케이션 정보가 없습니다.</p>;
  return (
    <div className="collocation-groups">
      {groups.map((group) => (
        <div key={group.level} className="collocation-group levelled-group">
          <LevelIndicator level={group.level} labelPrefix="콜로케이션 레벨" />
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
        <div key={group.level} className="example-group levelled-group">
          <LevelIndicator level={group.level} labelPrefix="예문 레벨" />
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
        <div key={group.level} className="quiz-group levelled-group">
          <LevelIndicator level={group.level} labelPrefix="미니 퀴즈 레벨" />
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

function PracticeAnswer({ text, blurred, blurAmount, onReveal, revealed = false }) {
  if (revealed) {
    return <span className="choice answer">{text}</span>;
  }

  const blurClass = blurred ? 'blurred' : 'masked';

  const handleReveal = () => {
    if (onReveal) onReveal();
  };

  return (
    <button
      type="button"
      className={`choice answer quiz-answer ${blurClass}`}
      style={blurred ? { '--blur-amount': `${blurAmount}px` } : undefined}
      onClick={handleReveal}
      aria-pressed={Boolean(revealed)}
      aria-label={revealed ? '정답이 표시되었습니다' : '정답 보기'}
      title={revealed ? '정답 표시됨' : '클릭해서 정답 보기'}
    >
      {text}
    </button>
  );
}

function PracticeCard({ question, settings }) {
  const [revealed, setRevealed] = useState(false);
  const maskedPrompt = revealed ? question.prompt : maskWord(question.prompt, question.word);
  const maskedChoices = useMemo(
    () => (revealed ? question.choices : question.choices?.map((choice) => maskWord(choice, question.word))),
    [question.choices, question.word, revealed]
  );

  const handleReveal = () => setRevealed(true);

  return (
    <article className={`practice-card ${revealed ? 'revealed' : ''}`}>
      <header className="practice-card-header">
        <p className="practice-type">{question.type}</p>
        <span className={`practice-word ${revealed ? 'visible' : 'hidden'}`}>{revealed ? question.word : '???'}</span>
      </header>
      {question.note && <p className="practice-note">{question.note}</p>}
      <p className="practice-prompt">{maskedPrompt}</p>
      {maskedChoices && (
        <ul className="practice-choices">
          {maskedChoices.map((choice) => (
            <li key={choice} className="choice">
              {choice}
            </li>
          ))}
        </ul>
      )}
      {question.hint && <p className="practice-hint">힌트: {question.hint}</p>}
      <div className={`practice-answer ${revealed ? 'revealed' : ''}`}>
        <PracticeAnswer
          text={question.answer}
          blurred={settings.blurQuizAnswers && !revealed}
          blurAmount={settings.quizBlurAmount}
          onReveal={handleReveal}
          revealed={revealed}
        />
      </div>
      {!revealed && (
        <button type="button" className="reveal-button" onClick={handleReveal}>
          정답 · 단어 보기
        </button>
      )}
    </article>
  );
}

function PracticeSection({ questions, settings, onShuffle, rangeLabel }) {
  const hasModules = settings.selectedPracticeModules.length > 0;

  return (
    <section className="practice-section">
      <header className="practice-header">
        <div>
          <p className="eyebrow">문제 모드</p>
          <h2>문제 형식으로 공부하기</h2>
          <p className="practice-desc">선택한 모듈을 섞어서 랜덤 문제를 제공합니다.</p>
          {rangeLabel && <p className="practice-range">{rangeLabel}</p>}
        </div>
        <button type="button" className="ghost" onClick={onShuffle}>
          문제 다시 섞기
        </button>
      </header>

      {!hasModules && <p className="status">맞춤 설정에서 문제 모듈을 선택해주세요.</p>}
      {hasModules && questions.length === 0 && <p className="status">선택한 모듈에 맞는 문제가 없습니다.</p>}

      {questions.length > 0 && (
        <div className="practice-grid">
          {questions.map((question, index) => (
            <PracticeCard key={`${question.type}-${question.word}-${index}`} question={question} settings={settings} />
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
    const normalized = normalizePageSize(Number.isNaN(next) ? pageSize : next);
    onPageSizeChange(normalized);
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
            {PAGE_SIZE_OPTIONS.map((size) => (
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

function ChunkControls({ currentChunk, totalChunks, onChange, rangeStart, rangeEnd, totalItems }) {
  if (!totalItems) return null;

  const options = Array.from({ length: totalChunks }, (_, idx) => idx + 1);
  const handleSelectChange = (event) => {
    const next = Number(event.target.value);
    if (Number.isNaN(next)) return;
    onChange(next);
  };

  return (
    <div className="chunk-bar" aria-label="단어 100개 묶음 전환">
      <div className="chunk-meta">
        <p className="eyebrow">단어 구간</p>
        <p className="chunk-range">
          {rangeStart}–{rangeEnd} / {totalItems} 단어
        </p>
      </div>
      <div className="chunk-actions">
        <button type="button" className="ghost" onClick={() => onChange(currentChunk - 1)} disabled={currentChunk === 1}>
          ← 이전 100개
        </button>
        <label className="chunk-select" htmlFor="chunkSelect">
          <span>묶음</span>
          <select id="chunkSelect" value={currentChunk} onChange={handleSelectChange}>
            {options.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <span className="chunk-total">/ {totalChunks}</span>
        </label>
        <button
          type="button"
          className="ghost"
          onClick={() => onChange(currentChunk + 1)}
          disabled={currentChunk === totalChunks}
        >
          다음 100개 →
        </button>
      </div>
    </div>
  );
}

function ViewSwitcher({ active, onChange }) {
  return (
    <div className="view-switcher" role="tablist" aria-label="학습 모드 전환">
      <button
        type="button"
        className={`view-tab ${active === 'words' ? 'active' : ''}`}
        role="tab"
        aria-selected={active === 'words'}
        onClick={() => onChange('words')}
      >
        단어 보기
      </button>
      <button
        type="button"
        className={`view-tab ${active === 'practice' ? 'active' : ''}`}
        role="tab"
        aria-selected={active === 'practice'}
        onClick={() => onChange('practice')}
      >
        문제 모드
      </button>
    </div>
  );
}

function filterByLevel(groups, levels) {
  if (!groups?.length) return [];
  if (!levels?.length) return groups;
  return groups.filter((group) => levels.includes(group.level));
}

function mulberry32(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let result = Math.imul(t ^ (t >>> 15), t | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleList(items, rng) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function pickOne(items, rng) {
  if (!items.length) return null;
  return items[Math.floor(rng() * items.length)];
}

function maskWord(text, word) {
  if (!text || !word || typeof text !== 'string') return text;
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escaped}\\b`, 'gi');
  return text.replace(pattern, '_____');
}

function resolvePreset(key, customPresetsList) {
  if (!key) return null;
  if (key.startsWith('custom-')) {
    const index = Number(key.split('-')[1]);
    if (Number.isInteger(index) && customPresetsList[index]) {
      return customPresetsList[index];
    }
    return null;
  }
  return presetOptions.find((preset) => preset.key === key) || null;
}

function mergePresetSettings(previousSettings, preset) {
  if (!preset?.settings) return previousSettings;
  const next = {
    ...previousSettings,
    ...preset.settings,
    wordSource: previousSettings.wordSource,
    selectedLevels: preset.settings.selectedLevels || previousSettings.selectedLevels,
  };

  if (preset.selectedPracticeModules) {
    next.selectedPracticeModules = preset.selectedPracticeModules;
  }

  return next;
}

function flattenExamples(entry) {
  return entry.examples?.flatMap((group) => group.items?.map((item) => ({ ...item, level: group.level })) || []) || [];
}

function buildPracticeQuestions(entries, settings, seed) {
  const rng = mulberry32(seed);
  const enabledModules = new Set(settings.selectedPracticeModules);
  const questions = [];

  entries.forEach((entry) => {
    const examples = flattenExamples(entry);

    if (enabledModules.has('preposition')) {
      const patternQuestions = (entry.prepositionPatterns || []).map((pattern) => {
        const base = pattern.example || `${entry.word} ${pattern.prep}`;
        const blanked = base.replace(new RegExp(`\\b${pattern.prep}\\b`, 'i'), '___');
        const prompt = blanked === base ? `${entry.word} ___` : blanked;
        return {
          type: '전치사 / 보어 채우기',
          prompt,
          answer: pattern.prep,
          hint: pattern.meaning_ko,
          word: entry.word,
        };
      });

      const complementQuestions = (entry.requiredComplements || [])
        .map((item) => {
          const [raw, meaning] = item.split(':').map((part) => part.trim());
          if (!raw?.includes('+')) return null;
          const parts = raw.split('+').map((part) => part.trim()).filter(Boolean);
          if (parts.length < 2) return null;
          return {
            type: '전치사 / 보어 채우기',
            prompt: `${parts.slice(0, -1).join(' + ')} ___`,
            answer: parts[parts.length - 1],
            hint: meaning,
            word: entry.word,
          };
        })
        .filter(Boolean);

      const question = pickOne([...patternQuestions, ...complementQuestions], rng);
      if (question) questions.push(question);
    }

    if (enabledModules.has('naturalness') && examples.length) {
      const example = pickOne(examples, rng);
      questions.push({
        type: '문장 자연성 판단 (O / X)',
        prompt: example.sentence,
        answer: '자연스럽다 (O)',
        word: entry.word,
      });
    }

    if (enabledModules.has('contextMeaning') && entry.meanings?.length > 1 && examples.length) {
      const example = pickOne(examples, rng);
      const correct = pickOne(entry.meanings, rng);
      const options = shuffleList(
        entry.meanings.map((meaning) => meaning.definition_ko),
        rng
      ).slice(0, Math.min(4, entry.meanings.length));
      if (!options.includes(correct.definition_ko)) {
        options.pop();
        options.push(correct.definition_ko);
      }
      const shuffled = shuffleList(options, rng);
      questions.push({
        type: '문맥 기반 의미 판단',
        prompt: example.sentence,
        choices: shuffled,
        answer: correct.definition_ko,
        word: entry.word,
      });
    }

    if (enabledModules.has('sentenceTranslation') && examples.length) {
      const example = pickOne(examples, rng);
      if (example?.meaning_ko) {
        questions.push({
          type: '문장 해석 (뜻 블러 처리)',
          prompt: example.sentence,
          answer: example.meaning_ko,
          word: entry.word,
        });
      }
    }

    if (enabledModules.has('meaningRecall') && entry.meanings?.length) {
      const meaning = pickOne(entry.meanings, rng);
      if (meaning?.definition_ko) {
        questions.push({
          type: '뜻 → 단어 회상',
          prompt: meaning.definition_ko,
          answer: entry.word,
          word: entry.word,
        });
      }
    }

    if (enabledModules.has('wrongCombination') && entry.prepositionPatterns?.length) {
      const preps = Array.from(new Set(entry.prepositionPatterns.map((pattern) => pattern.prep)));
      const pool = ['to', 'for', 'with', 'on', 'in', 'at', 'from', 'by', 'about', 'over', 'into'];
      const wrongPrep = pickOne(pool.filter((prep) => !preps.includes(prep)), rng);
      if (wrongPrep) {
        const choices = shuffleList([...preps, wrongPrep].map((prep) => `${entry.word} ${prep}`), rng);
        questions.push({
          type: '잘못된 결합 찾기',
          prompt: '다음 중 잘못된 결합을 고르세요.',
          choices,
          answer: `${entry.word} ${wrongPrep}`,
          word: entry.word,
        });
      }
    }

    if (enabledModules.has('rewrite') && examples.length) {
      const example = pickOne(examples, rng);
      const regex = new RegExp(`\\b${entry.word}\\b`, 'i');
      const maskedSentence = regex.test(example.sentence)
        ? example.sentence.replace(regex, '_____')
        : example.sentence;
      questions.push({
        type: '문장 재작성 (지정 단어 사용)',
        prompt: maskedSentence,
        answer: example.sentence,
        word: entry.word,
        note: `지정 단어: ${entry.word}`,
      });
    }
  });

  const shuffled = shuffleList(questions, rng);
  return shuffled.slice(0, settings.practiceItemLimit);
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
      <header className="lex-card-header sticky-entry">
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
  const initialViewState = useMemo(() => loadInitialViewState(), []);

  const [settings, setSettings] = useState(() => loadInitialSettings());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState(initialViewState.viewMode);
  const [chunkIndex, setChunkIndex] = useState(initialViewState.chunkIndex);
  const [currentPage, setCurrentPage] = useState(initialViewState.page);
  const [pageSize, setPageSize] = useState(initialViewState.pageSize);
  const [savedLocation, setSavedLocation] = useState(initialViewState.savedLocation);
  const [practiceSeed, setPracticeSeed] = useState(() => Date.now());
  const [activePreset, setActivePreset] = useState(() => readCookie(PRESET_COOKIE) || '');
  const [customPresets, setCustomPresets] = useState(() => {
    const savedCustom = readJsonCookie(CUSTOM_PRESET_COOKIE, []);
    return normalizeCustomPresets(Array.isArray(savedCustom) ? savedCustom : []);
  });

  const handleWordSourceChange = (nextSource) => {
    setSettings((prev) => ({ ...prev, wordSource: nextSource }));
    setChunkIndex(0);
    setCurrentPage(1);
  };

  const handlePresetApply = (presetKey) => {
    const preset = resolvePreset(presetKey, customPresets);
    if (!preset) return;
    setSettings((prev) => mergePresetSettings(prev, preset));
    setActivePreset(presetKey);
  };

  const handleSaveCustomPreset = (slotIndex) => {
    const baseLabel = customPresets[slotIndex]?.label || `커스텀 ${slotIndex + 1}`;
    const label =
      typeof window !== 'undefined'
        ? window.prompt('커스텀 프리셋 이름을 입력하세요.', baseLabel)?.trim() || baseLabel
        : baseLabel;

    const payload = {
      key: `custom-${slotIndex}`,
      label,
      settings: { ...settings },
      selectedPracticeModules: settings.selectedPracticeModules,
    };

    setCustomPresets((prev) => {
      const next = [...prev];
      next[slotIndex] = payload;
      return normalizeCustomPresets(next);
    });
    setActivePreset(`custom-${slotIndex}`);
  };

  const handleApplyCustomPreset = (slotIndex) => {
    handlePresetApply(`custom-${slotIndex}`);
  };

  useEffect(() => {
    writeCookie(SETTINGS_COOKIE, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (activePreset) {
      writeCookie(PRESET_COOKIE, activePreset);
    }
  }, [activePreset]);

  useEffect(() => {
    writeCookie(CUSTOM_PRESET_COOKIE, JSON.stringify(customPresets));
  }, [customPresets]);

  useEffect(() => {
    writeCookie(
      VIEW_COOKIE,
      JSON.stringify({
        viewMode,
        chunkIndex,
        page: currentPage,
        pageSize,
      })
    );
  }, [viewMode, chunkIndex, currentPage, pageSize]);

  useEffect(() => {
    const payload = {
      viewMode,
      chunkIndex,
      page: currentPage,
      pageSize,
    };
    writeCookie(POSITION_COOKIE, JSON.stringify(payload));
  }, [chunkIndex, currentPage, pageSize, viewMode]);

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
    const chunkCount = Math.max(1, Math.ceil(entries.length / CHUNK_SIZE));
    if (chunkIndex > chunkCount - 1) {
      setChunkIndex(chunkCount - 1);
    }
  }, [chunkIndex, entries.length]);

  const chunkCount = Math.max(1, Math.ceil(entries.length / CHUNK_SIZE));
  const chunkStart = clamp(chunkIndex * CHUNK_SIZE, 0, Math.max(0, entries.length - 1));
  const chunkEnd = Math.min(entries.length, chunkStart + CHUNK_SIZE);
  const chunkEntries = useMemo(() => entries.slice(chunkStart, chunkEnd), [entries, chunkStart, chunkEnd]);
  const chunkRangeStart = entries.length ? chunkStart + 1 : 0;
  const chunkRangeEnd = chunkEnd;
  const isWordView = viewMode === 'words';
  const isPracticeView = viewMode === 'practice';
  const viewTitle = isPracticeView ? '문제 모드' : '단어 카드';
  const viewSubtitle = isPracticeView ? '랜덤 문제로 연습하기' : '단어 카드로 살펴보기';

  useEffect(() => {
    if (!entries.length || !savedLocation) return;
    const locationData =
      typeof savedLocation === 'object' ? savedLocation : { scroll: Number(savedLocation) };
    const nextChunk = clamp(locationData.chunkIndex ?? chunkIndex, 0, chunkCount - 1);
    if (nextChunk !== chunkIndex) setChunkIndex(nextChunk);
    const itemsInChunk = entries.slice(nextChunk * CHUNK_SIZE, nextChunk * CHUNK_SIZE + CHUNK_SIZE).length;
    const pagesForChunk = Math.max(1, Math.ceil(itemsInChunk / pageSize));
    const targetPage = clamp(locationData.page ?? locationData.currentPage ?? currentPage, 1, pagesForChunk);
    if (targetPage !== currentPage) setCurrentPage(targetPage);
    if (locationData.viewMode && locationData.viewMode !== viewMode) setViewMode(locationData.viewMode);
    const savedScroll = locationData.scroll ?? locationData.position ?? locationData.scrollY;
    if (typeof savedScroll === 'number') {
      window.scrollTo({ top: savedScroll, behavior: 'smooth' });
    }
    setSavedLocation(null);
  }, [chunkCount, chunkIndex, currentPage, entries, pageSize, savedLocation, viewMode]);

  const totalPages = Math.max(1, Math.ceil(Math.max(chunkEntries.length, 1) / pageSize));
  const visibleEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return chunkEntries.slice(start, start + pageSize);
  }, [chunkEntries, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage((prev) => clamp(prev, 1, totalPages));
  }, [totalPages]);

  useEffect(() => {
    const handleScroll = () => {
      const payload = {
        viewMode,
        chunkIndex,
        page: currentPage,
        pageSize,
        scroll: Math.round(window.scrollY),
      };
      writeCookie(POSITION_COOKIE, JSON.stringify(payload));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chunkIndex, currentPage, pageSize, viewMode]);

  const practiceQuestions = useMemo(
    () => buildPracticeQuestions(chunkEntries, settings, practiceSeed),
    [chunkEntries, settings, practiceSeed]
  );

  const handlePageChange = (nextPage) => {
    const page = Math.min(Math.max(nextPage, 1), totalPages);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChunkChange = (nextChunk) => {
    const safeChunk = clamp(nextChunk, 1, chunkCount) - 1;
    setChunkIndex(safeChunk);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewChange = (nextView) => {
    setViewMode(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`lex-page ${MOBILE_PREVIEW ? 'lex-page--mobile' : ''}`}>
      <header className="lex-topbar">
        <div className="topbar-title">
          <p className="eyebrow">Lexicon Lab</p>
          <h1>{viewTitle}</h1>
          <p className="subtitle">{viewSubtitle}</p>
          <ViewSwitcher active={viewMode} onChange={handleViewChange} />
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

      {isWordView && settings.showWordSection && !loading && !error && entries.length > 0 && (
        <>
          <ChunkControls
            currentChunk={chunkIndex + 1}
            totalChunks={chunkCount}
            onChange={handleChunkChange}
            rangeStart={chunkRangeStart}
            rangeEnd={chunkRangeEnd}
            totalItems={entries.length}
          />
          <section className="word-section">
            <header className="section-title-row">
              <div>
                <p className="eyebrow">단어 보기</p>
                <h2>현재 구간 카드 목록</h2>
                <p className="section-subtitle">페이지당 {pageSize}개, 100개 단위로 이동합니다.</p>
              </div>
            </header>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={handlePageChange}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={chunkEntries.length}
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
              totalItems={chunkEntries.length}
            />
          </section>
        </>
      )}

      {isWordView && !settings.showWordSection && <p className="status">맞춤 설정에서 단어 보기 섹션을 켜주세요.</p>}

      {isPracticeView && settings.showPracticeSection && !loading && !error && entries.length > 0 && (
        <>
          <ChunkControls
            currentChunk={chunkIndex + 1}
            totalChunks={chunkCount}
            onChange={handleChunkChange}
            rangeStart={chunkRangeStart}
            rangeEnd={chunkRangeEnd}
            totalItems={entries.length}
          />
          <PracticeSection
            questions={practiceQuestions}
            settings={settings}
            onShuffle={() => setPracticeSeed(Date.now())}
            rangeLabel={`${chunkRangeStart}–${chunkRangeEnd}번 단어 묶음에서 출제됩니다.`}
          />
        </>
      )}

      {isPracticeView && !settings.showPracticeSection && (
        <p className="status">맞춤 설정에서 문제 모드를 켜면 연습 화면으로 전환됩니다.</p>
      )}

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
        activePreset={activePreset}
        onPresetApply={handlePresetApply}
        customPresets={customPresets}
        onSaveCustomPreset={handleSaveCustomPreset}
        onApplyCustomPreset={handleApplyCustomPreset}
      />
    </div>
  );
}
