import { useEffect, useMemo, useRef, useState } from 'react';
import './LexiconLab.css';
import { hrefToTransferPage } from './transferNav.js';
import './transferHubNav.css';
import {
  CHUNK_SIZE,
  CUSTOM_PRESET_COOKIE,
  MAX_CUSTOM_PRESETS,
  MOBILE_PREVIEW,
  PAGE_SIZE_OPTIONS,
  POSITION_COOKIE,
  PRESET_COOKIE,
  SETTINGS_COOKIE,
  VIEW_COOKIE,
  cloneDefaultSettings,
  defaultSettings,
  practiceModules,
  presetOptions,
} from './lexicon/constants.js';
import {
  loadInitialSettings,
  loadInitialViewState,
  normalizeCustomPresets,
  readCookie,
  readJsonCookie,
  writeCookie,
} from './lexicon/cookies.js';
import {
  buildPracticeQuestions,
  clamp,
  filterByLevel,
  getWordSourceKey,
  getWordSourceLabel,
  maskWord,
  normalizePageSize,
} from './lexicon/utils.js';

const wordSources = import.meta.glob('../public/assets/words/json/**/*.json', { eager: true });

const wordSourceOptions = Array.from(
  new Set(
    Object.keys(wordSources)
      .map(getWordSourceKey)
      .filter(Boolean)
  )
).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

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

function formatMeaningText(text) {
  if (!text) return '';
  // 세미콜론을 엔터로 변환 (세미콜론 제거)
  return text.replace(/;\s*/g, '\n');
}

function formatTextWithBold(text) {
  if (!text) return '';
  
  let result = String(text);
  
  // 이미 <strong> 태그로 감싸진 부분은 제외하고 처리하기 위해 임시 마커 사용
  const strongMarkers = [];
  let markerIndex = 0;
  
  // 기존 <strong> 태그를 임시 마커로 교체
  result = result.replace(/<strong>([^<]*)<\/strong>/g, (match) => {
    const marker = `__STRONG_${markerIndex}__`;
    strongMarkers.push(match);
    markerIndex++;
    return marker;
  });
  
  // 다양한 따옴표 패턴 처리
  // 작은따옴표: ' (U+2018), ' (U+2019), ' (일반)
  // 큰따옴표: " (U+201C), " (U+201D), " (일반)
  
  // 유니코드 따옴표 쌍 처리 (더 구체적인 패턴부터)
  result = result.replace(/'([^']+)'/g, '<strong>$1</strong>');  // 유니코드 작은따옴표 ''
  result = result.replace(/'([^']+)'/g, '<strong>$1</strong>');  // 유니코드 작은따옴표 ''
  result = result.replace(/"([^"]+)"/g, '<strong>$1</strong>');  // 유니코드 큰따옴표 ""
  result = result.replace(/"([^"]+)"/g, '<strong>$1</strong>');  // 유니코드 큰따옴표 ""
  
  // 일반 따옴표 쌍 처리
  result = result.replace(/'([^']+)'/g, '<strong>$1</strong>');  // 일반 작은따옴표 ''
  result = result.replace(/"([^"]+)"/g, '<strong>$1</strong>');  // 일반 큰따옴표 ""
  
  // 임시 마커를 원래 <strong> 태그로 복원
  strongMarkers.forEach((marker, index) => {
    result = result.replace(`__STRONG_${index}__`, marker);
  });
  
  return result;
}

function formatConceptText(text) {
  return formatTextWithBold(text);
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
  activePreset,
  onPresetApply,
  customPresets,
  onSaveCustomPreset,
  onApplyCustomPreset,
  onReset,
}) {
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
        <div className="settings-header-actions">
          <button className="ghost subtle" type="button" onClick={onReset}>
            초기화
          </button>
          <button className="ghost" type="button" onClick={onClose} aria-label="설정 닫기">
            ✕
          </button>
        </div>
      </header>

      <SettingGroup title="글자 크기" description="화면에 맞게 글자 크기를 조절할 수 있습니다.">
        <div className="setting-field">
          <label htmlFor="fontScale">글자 크기 배율</label>
          <div className="font-size-control">
            <label htmlFor="fontScale">크기</label>
            <input
              id="fontScale"
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={settings.fontScale || 1}
              onChange={(e) => {
                const scale = Number(e.target.value);
                onChange({ ...settings, fontScale: scale });
                document.documentElement.style.setProperty('--font-scale', scale);
              }}
            />
            <span className="font-size-value">{Math.round((settings.fontScale || 1) * 100)}%</span>
          </div>
          <p className="setting-desc">75% ~ 150% 범위에서 조절 가능합니다.</p>
        </div>
      </SettingGroup>

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

        <div className="settings-import-export">
          <div className="setting-field">
            <label htmlFor="settingsExport">설정 내보내기</label>
            <div className="export-actions">
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  const exportData = {
                    settings: { ...settings },
                    selectedPracticeModules: settings.selectedPracticeModules,
                  };
                  const jsonString = JSON.stringify(exportData, null, 2);
                  navigator.clipboard.writeText(jsonString).then(() => {
                    alert('설정이 클립보드에 복사되었습니다!');
                  }).catch(() => {
                    const textarea = document.createElement('textarea');
                    textarea.value = jsonString;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    alert('설정이 클립보드에 복사되었습니다!');
                  });
                }}
              >
                설정 복사
              </button>
            </div>
            <p className="setting-desc">현재 설정을 JSON 문자열로 복사합니다.</p>
          </div>

          <div className="setting-field">
            <label htmlFor="settingsImport">설정 가져오기</label>
            <textarea
              id="settingsImport"
              placeholder="설정 JSON을 여기에 붙여넣으세요..."
              rows="4"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fbff',
                padding: '0.65rem 0.75rem',
                borderRadius: '12px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                resize: 'vertical',
              }}
            />
            <div className="import-actions" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  const textarea = document.getElementById('settingsImport');
                  const jsonString = textarea.value.trim();
                  if (!jsonString) {
                    alert('설정 JSON을 입력해주세요.');
                    return;
                  }
                  try {
                    const imported = JSON.parse(jsonString);
                    if (imported.settings) {
                      const newSettings = {
                        ...settings,
                        ...imported.settings,
                        ...(imported.selectedPracticeModules ? { selectedPracticeModules: imported.selectedPracticeModules } : {}),
                      };
                      onChange(newSettings);
                      textarea.value = '';
                      alert('설정이 적용되었습니다!');
                    } else {
                      alert('올바른 설정 형식이 아닙니다.');
                    }
                  } catch (err) {
                    alert(`설정을 불러오는데 실패했습니다: ${err.message}`);
                  }
                }}
              >
                설정 적용
              </button>
              <button
                type="button"
                className="ghost subtle"
                onClick={() => {
                  const textarea = document.getElementById('settingsImport');
                  textarea.value = '';
                }}
              >
                지우기
              </button>
            </div>
            <p className="setting-desc">다른 사람의 설정 JSON을 붙여넣어 적용할 수 있습니다.</p>
          </div>
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

      <SettingGroup title="뜻 · 관계" description="의미 설명과 연결 관계를 얼마나 보여 줄지 제어합니다.">
        <SettingToggle
          label="단어 관계 표시"
          description="파생어, 관련어, 동의/반의어 등 연결 관계 카테고리를 보여 줍니다."
          checked={settings.showRelations}
          onChange={(value) => onChange({ ...settings, showRelations: value })}
        />
      </SettingGroup>

      <SettingGroup title="레벨 노출 방식" description="필요한 레벨만 켜서 살펴보세요. (상/중/하 개별 on/off)">
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
        <div className="settings-grid">
          <SettingToggle
            label="기본 단어 뜻 가리기"
            description="주요 의미(definition_ko)를 흐리게 두고, 클릭하면 선명하게 드러나도록 합니다."
            checked={settings.blurBasicMeanings}
            onChange={(value) => onChange({ ...settings, blurBasicMeanings: value })}
          />
          <SettingToggle
            label="문장/콜로케이션 뜻 가리기"
            description="예문 해석과 콜로케이션 뜻을 흐리게 두고, 클릭하면 선명하게 드러나도록 합니다."
            checked={settings.blurContextMeanings}
            onChange={(value) => onChange({ ...settings, blurContextMeanings: value })}
          />
        </div>
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

function getLevelTone(level) {
  if (level === '상') return 'high';
  if (level === '중') return 'mid';
  if (level === '하') return 'low';
  return 'neutral';
}

function LevelIndicator({ level }) {
  const tone = getLevelTone(level);
  const label = level ? `${level} 레벨 구분선` : '레벨 구분 없음';

  return (
    <div className={`level-indicator level-${tone}`}>
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

function BlurReveal({ text, as = 'span', blurred, className = '', applyBold = false }) {
  const [revealed, setRevealed] = useState(false);
  const Tag = as;
  const formattedText = applyBold ? formatTextWithBold(text) : text;

  if (!blurred) {
    if (applyBold) {
      return <Tag className={className} dangerouslySetInnerHTML={{ __html: formattedText }} />;
    }
    return <Tag className={className}>{text}</Tag>;
  }

  const handleReveal = () => setRevealed(true);
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setRevealed(true);
    }
  };

  return (
    <Tag
      className={`${className} blur-reveal ${revealed ? 'revealed' : 'blurred'}`}
      role="button"
      tabIndex={0}
      onClick={handleReveal}
      onKeyDown={handleKeyDown}
      aria-pressed={revealed}
      aria-label={revealed ? '뜻이 표시되었습니다' : '클릭하여 뜻 보기'}
    >
      {applyBold ? (
        <span className="blur-reveal__text" dangerouslySetInnerHTML={{ __html: formattedText }} />
      ) : (
        <span className="blur-reveal__text">{text}</span>
      )}
      {!revealed && <span className="blur-reveal__hint">탭/클릭하여 보기</span>}
    </Tag>
  );
}

function PillList({ label, items, showMeaning, hiddenWords = [], onWordClick }) {
  if (!items || items.length === 0) return null;
  const renderItem = (item) => {
    if (typeof item === 'string') return item;
    if (item?.word) {
      const meaning = showMeaning && item.meaning_ko ? ` (${item.meaning_ko})` : '';
      return `${item.word}${meaning}`;
    }
    return '';
  };

  const getWordKey = (item) => {
    if (typeof item === 'string') return item.toLowerCase();
    if (item?.word) return String(item.word).toLowerCase();
    return '';
  };

  const filteredItems = items.filter((item) => {
    const key = getWordKey(item);
    return key && !hiddenWords.includes(key);
  });

  if (filteredItems.length === 0) return null;

  return (
    <div className="pill-row pill-row--scrollable">
      <span className="pill-label">{label}</span>
      <div className="pill-items pill-items--scrollable">
        {filteredItems.map((item, index) => {
          const wordKey = getWordKey(item);
          const isHidden = hiddenWords.includes(wordKey);
          return (
            <span
              className="pill pill-clickable"
              key={`${renderItem(item)}-${index}`}
              onClick={() => onWordClick && onWordClick(wordKey)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && onWordClick) {
                  e.preventDefault();
                  onWordClick(wordKey);
                }
              }}
              title="클릭하여 숨기기"
            >
              {renderItem(item)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function MeaningList({ meanings, limit, showKorean, blurBasicMeanings }) {
  const limited = useMemo(() => meanings?.slice(0, limit) ?? [], [limit, meanings]);

  if (!limited.length) return <p className="muted">뜻 정보가 없습니다.</p>;

  return (
    <ul className="meaning-list">
      {limited.map((meaning, index) => (
        <li key={`${meaning.definition_en}-${index}`}>
          <div className="meaning-texts">
            <p className="meaning-en">{meaning.definition_en}</p>
            {showKorean && meaning.definition_ko && (
              <BlurReveal as="p" className="meaning-ko" text={formatMeaningText(meaning.definition_ko)} blurred={blurBasicMeanings} />
            )}
            {meaning.note && <p className="meaning-note" dangerouslySetInnerHTML={{ __html: formatTextWithBold(meaning.note) }} />}
          </div>
        </li>
      ))}
    </ul>
  );
}

function PrepositionPatternList({ patterns, blurBasicMeanings }) {
  if (!patterns?.length) return <p className="muted">전치사 패턴 정보가 없습니다.</p>;
  return (
    <ul className="preposition-list">
      {patterns.map((pattern, index) => (
        <li key={`${pattern.prep}-${index}`}>
          <span className="pill">{pattern.prep}</span>
          <div>
            {pattern.meaning_ko && (
              <BlurReveal as="p" className="meaning-ko" text={formatMeaningText(pattern.meaning_ko)} blurred={blurBasicMeanings} />
            )}
            {pattern.example && <p className="meaning-note" dangerouslySetInnerHTML={{ __html: formatTextWithBold(`예: ${pattern.example}`) }} />}
          </div>
        </li>
      ))}
    </ul>
  );
}

function CollocationList({ groups, showKorean, limitPerLevel, blurContextMeanings }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [groups]);

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    const groupWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: -groupWidth, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    const groupWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: groupWidth, behavior: 'smooth' });
  };

  if (!groups || groups.length === 0) return <p className="muted">콜로케이션 정보가 없습니다.</p>;
  return (
    <div className="collocation-groups-wrapper">
      <div ref={scrollRef} className="collocation-groups">
        {groups.map((group) => (
          <div key={group.level} className="collocation-group">
            <LevelIndicator level={group.level} />
            <ul className="collocation-list">
              {group.items?.length ? (
                (limitPerLevel ? group.items.slice(0, limitPerLevel) : group.items).map((item, index) => (
                  <li key={`${item.phrase}-${index}`}>
                    <div className="collocation-head">
                      <span className="phrase" dangerouslySetInnerHTML={{ __html: formatTextWithBold(item.phrase) }} />
                      {showKorean && item.meaning_ko && (
                        <BlurReveal
                          as="span"
                          className="collocation-meaning"
                          text={formatMeaningText(item.meaning_ko)}
                          blurred={blurContextMeanings}
                          applyBold={true}
                        />
                      )}
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
      {canScrollLeft && (
        <button type="button" className="scroll-arrow scroll-arrow-left" onClick={scrollLeft} aria-label="왼쪽으로 스크롤">
          ◀
        </button>
      )}
      {canScrollRight && (
        <button type="button" className="scroll-arrow scroll-arrow-right" onClick={scrollRight} aria-label="오른쪽으로 스크롤">
          ▶
        </button>
      )}
    </div>
  );
}

function ExampleList({ examples, showKorean, limitPerLevel, blurContextMeanings }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [examples]);

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    const groupWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: -groupWidth, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    const groupWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: groupWidth, behavior: 'smooth' });
  };

  if (!examples || examples.length === 0) return <p className="muted">예문이 없습니다.</p>;
  return (
    <div className="example-groups-wrapper">
      <div ref={scrollRef} className="example-groups">
        {examples.map((group) => (
          <div key={group.level} className="example-group">
            <LevelIndicator level={group.level} />
            <ul className="example-list">
              {group.items?.length ? (
                (limitPerLevel ? group.items.slice(0, limitPerLevel) : group.items).map((item, index) => (
                  <li key={`${item.sentence}-${index}`}>
                    <p className="meaning-en" dangerouslySetInnerHTML={{ __html: formatTextWithBold(item.sentence) }} />
                    {showKorean && item.meaning_ko && (
                      <BlurReveal
                        as="p"
                        className="meaning-ko"
                        text={formatMeaningText(item.meaning_ko)}
                        blurred={blurContextMeanings}
                        applyBold={true}
                      />
                    )}
                  </li>
                ))
              ) : (
                <li className="muted">예문이 없습니다.</li>
              )}
            </ul>
          </div>
        ))}
      </div>
      {canScrollLeft && (
        <button type="button" className="scroll-arrow scroll-arrow-left" onClick={scrollLeft} aria-label="왼쪽으로 스크롤">
          ◀
        </button>
      )}
      {canScrollRight && (
        <button type="button" className="scroll-arrow scroll-arrow-right" onClick={scrollRight} aria-label="오른쪽으로 스크롤">
          ▶
        </button>
      )}
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

function QuizList({
  quiz,
  showKorean,
  limitPerLevel,
  showTitle = true,
  blurAnswers,
  blurAmount,
  blurBasicMeanings,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [quiz]);

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    const groupWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: -groupWidth, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    const groupWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: groupWidth, behavior: 'smooth' });
  };

  if (!quiz || quiz.length === 0) return null;
  return (
    <div className="quiz-list-wrapper">
      {showTitle && <p className="quiz-title">미니 퀴즈</p>}
      <div ref={scrollRef} className="quiz-groups">
        {quiz.map((group) => (
          <div key={group.level} className="quiz-group">
            <LevelIndicator level={group.level} />
            <ul className="quiz-items">
              {group.items?.length ? (
                group.items.slice(0, limitPerLevel).map((item, index) => (
                  <li key={`${item.q}-${index}`}>
                    <p className="quiz-question" dangerouslySetInnerHTML={{ __html: formatTextWithBold(item.q) }} />
                    {showKorean && item.meaning_ko && (
                      <BlurReveal
                        as="p"
                        className="meaning-note quiz-hint"
                        text={item.meaning_ko}
                        blurred={blurBasicMeanings}
                        applyBold={true}
                      />
                    )}
                    <div className="quiz-choices">
                      <QuizAnswer text={item.a} blurred={blurAnswers} blurAmount={blurAmount} />
                    </div>
                  </li>
                ))
              ) : (
                <li className="muted">이 레벨의 퀴즈가 없습니다.</li>
              )}
            </ul>
          </div>
        ))}
      </div>
      {canScrollLeft && (
        <button type="button" className="scroll-arrow scroll-arrow-left" onClick={scrollLeft} aria-label="왼쪽으로 스크롤">
          ◀
        </button>
      )}
      {canScrollRight && (
        <button type="button" className="scroll-arrow scroll-arrow-right" onClick={scrollRight} aria-label="오른쪽으로 스크롤">
          ▶
        </button>
      )}
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

function PracticeCard({ question, settings, onToggleMark }) {
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
        <div className="practice-header-left">
          <span className="practice-type-badge">{question.type}</span>
          <span className={`practice-word ${revealed ? 'visible' : 'hidden'}`}>
            {revealed ? question.word : '???'}
          </span>
        </div>
        <button
          type="button"
          className="practice-card-dismiss"
          onClick={() => onToggleMark(question.word)}
          aria-label="이 단어를 연습 대상에서 제거"
          title="이 단어를 연습 대상에서 제거"
        >
          ✕
        </button>
      </header>
      
      <div className="practice-card-body">
        {question.note && (
          <div className="practice-note">
            <span className="note-icon">ℹ️</span>
            <span>{question.note}</span>
          </div>
        )}
        
        <div className="practice-prompt-wrapper">
          <p className="practice-prompt">{maskedPrompt}</p>
        </div>

        {maskedChoices && maskedChoices.length > 0 && (
          <div className="practice-choices-wrapper">
            <p className="choices-label">선택지</p>
            <ul className="practice-choices">
              {maskedChoices.map((choice, idx) => (
                <li key={`${choice}-${idx}`} className="practice-choice-item">
                  <span className="choice-letter">{String.fromCharCode(65 + idx)}</span>
                  <span className="choice-text">{choice}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {question.hint && (
          <div className="practice-hint">
            <span className="hint-icon">💡</span>
            <span>{question.hint}</span>
          </div>
        )}

        <div className={`practice-answer-wrapper ${revealed ? 'revealed' : ''}`}>
          <p className="answer-label">정답</p>
          <PracticeAnswer
            text={question.answer}
            blurred={settings.blurQuizAnswers && !revealed}
            blurAmount={settings.quizBlurAmount}
            onReveal={handleReveal}
            revealed={revealed}
          />
        </div>
      </div>

      {!revealed && (
        <footer className="practice-card-footer">
          <button type="button" className="reveal-button" onClick={handleReveal}>
            <span className="reveal-icon">👁️</span>
            <span>정답 보기</span>
          </button>
        </footer>
      )}
    </article>
  );
}

function PracticeSection({ questions, settings, onShuffle, rangeLabel, onToggleMark }) {
  const hasModules = settings.selectedPracticeModules.length > 0;

  return (
    <section className="practice-section">
      <header className="practice-header">
        <div className="practice-header-content">
          <div>
            <p className="eyebrow">문제 모드</p>
            <h2>문제 형식으로 공부하기</h2>
            <p className="practice-desc">선택한 모듈을 섞어서 랜덤 문제를 제공합니다.</p>
            {rangeLabel && <p className="practice-range">{rangeLabel}</p>}
          </div>
          <button type="button" className="shuffle-button" onClick={onShuffle}>
            <span className="shuffle-icon">🔀</span>
            <span>문제 다시 섞기</span>
          </button>
        </div>
      </header>

      {!hasModules && (
        <div className="practice-empty-state">
          <p className="empty-icon">📚</p>
          <p className="empty-message">맞춤 설정에서 문제 모듈을 선택해주세요.</p>
        </div>
      )}
      {hasModules && questions.length === 0 && (
        <div className="practice-empty-state">
          <p className="empty-icon">🔍</p>
          <p className="empty-message">선택한 모듈에 맞는 문제가 없습니다.</p>
        </div>
      )}

      {questions.length > 0 && (
        <div className="practice-grid">
          {questions.map((question, index) => (
            <PracticeCard
              key={`${question.type}-${question.word}-${index}`}
              question={question}
              settings={settings}
              onToggleMark={onToggleMark}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PaginationControls({ currentPage, totalPages, onChange, pageSize, onPageSizeChange, totalItems, sticky = false }) {
  if (!totalItems) return null;

  const handleSelectChange = (event) => {
    const next = Number(event.target.value);
    const normalized = normalizePageSize(Number.isNaN(next) ? pageSize : next);
    onPageSizeChange(normalized);
  };

  return (
    <div className={`pagination-bar ${sticky ? 'pagination-bar--sticky' : ''}`} aria-label="카드 페이지 전환">
      <div className="pagination-meta">
        <p className="eyebrow">현재 구간: {totalItems}개 단어</p>
        <p className="pagination-range">
          페이지 {currentPage} / {totalPages}
        </p>
      </div>
      <div className="pagination-actions">
        <label className="page-size" htmlFor="pageSize">
          <span>페이지당</span>
          <select id="pageSize" value={pageSize} onChange={handleSelectChange}>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}개
              </option>
            ))}
          </select>
        </label>
        <div className="page-buttons">
          <button
            type="button"
            className="page-nav-button"
            onClick={() => onChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
          >
            ◀
          </button>
          <span className="page-status">
            {String(currentPage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </span>
          <button
            type="button"
            className="page-nav-button"
            onClick={() => onChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
          >
            ▶
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
        <p className="eyebrow">단어 구간 (100개 단위)</p>
        <p className="chunk-range">
          {rangeStart}–{rangeEnd} / {totalItems} 단어
        </p>
      </div>
      <div className="chunk-actions">
        <button 
          type="button" 
          className="chunk-nav-button" 
          onClick={() => onChange(currentChunk - 1)} 
          disabled={currentChunk === 1}
          aria-label="이전 100개"
        >
          ◀
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
          className="chunk-nav-button"
          onClick={() => onChange(currentChunk + 1)}
          disabled={currentChunk === totalChunks}
          aria-label="다음 100개"
        >
          ▶
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

  if (preset.selectedPracticeModules !== undefined) {
    next.selectedPracticeModules = preset.selectedPracticeModules;
  }

  // 문맥 연습 프리셋의 경우 문제 모드가 확실히 꺼지도록 보장
  if (preset.key === 'context-practice') {
    next.showPracticeSection = false;
    next.selectedPracticeModules = [];
  }

  return next;
}

function LexiconEntry({ entry, settings, isMarked, onToggleMark, hiddenRelationWords = [], onToggleRelationWord }) {
  const [openSections, setOpenSections] = useState({
    core: true,
    context: true,
    grammar: true,
    resources: true,
    quiz: true,
  });

  // 단어에서 품사 부분 제거 (예: "ceaseverb/noun" -> "cease", "negotiationnoun" -> "negotiation")
  const cleanWord = useMemo(() => {
    if (!entry.word) return '';
    let word = entry.word.trim();
    const originalWord = word;
    
    // 품사 목록 (긴 것부터 먼저 매칭하도록 정렬)
    const posWords = ['preposition', 'conjunction', 'interjection', 'determiner', 'auxiliary', 'adjective', 'adverb', 'pronoun', 'verb', 'noun'];
    
    // "negotiationnoun" 같은 경우: 단어 끝에 품사가 붙은 패턴 제거
    // 먼저 "verb/noun" 같은 슬래시 패턴 처리
    const slashPattern = new RegExp(
      `(${posWords.join('|')})\\s*\\/\\s*(${posWords.join('|')})$`,
      'i'
    );
    let match = word.match(slashPattern);
    if (match) {
      word = word.slice(0, -match[0].length).trim();
    }
    
    // 그 다음 단일 품사 패턴 처리 (예: "noun" in "negotiationnoun")
    // 각 품사를 긴 것부터 확인
    for (const pos of posWords) {
      const lowerWord = word.toLowerCase();
      const lowerPos = pos.toLowerCase();
      if (lowerWord.endsWith(lowerPos)) {
        const beforePos = word.slice(0, -pos.length);
        // 단어가 품사로만 이루어져 있지 않고, 품사 앞에 실제 단어가 있는 경우에만 제거
        if (beforePos.length > 0 && beforePos.trim().length > 0) {
          word = beforePos.trim();
          break; // 하나만 제거하고 종료
        }
      }
    }
    
    // 디버깅: 원본 단어에 품사가 포함되어 있었는지 확인
    if (originalWord !== word && originalWord.toLowerCase().includes('noun') || originalWord.toLowerCase().includes('verb')) {
      console.log(`[cleanWord] "${originalWord}" -> "${word}"`);
    }
    
    return word;
  }, [entry.word]);

  const availableLevels = useMemo(() => {
    const levelSet = new Set(['상', '중', '하']);
    [entry.collocations, entry.examples, entry.quiz].forEach((groups) => {
      groups?.forEach((group) => {
        if (group.level) levelSet.add(group.level);
      });
    });
    return Array.from(levelSet);
  }, [entry]);

  const levelsToShow = settings.selectedLevels?.length ? settings.selectedLevels : availableLevels;

  const filteredCollocations = filterByLevel(entry.collocations, levelsToShow);
  const filteredExamples = filterByLevel(entry.examples, levelsToShow);
  const filteredQuiz = filterByLevel(entry.quiz, levelsToShow);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    setOpenSections((prev) => ({
      ...prev,
      context: settings.showUsageContext ? true : prev.context,
      grammar: settings.showFormDetails ? true : prev.grammar,
      resources: settings.showCollocations || settings.showExamples ? true : prev.resources,
      quiz: settings.showQuiz ? true : prev.quiz,
    }));
  }, [settings.showCollocations, settings.showExamples, settings.showFormDetails, settings.showQuiz, settings.showUsageContext]);

  return (
    <article className={`lex-card ${isMarked ? 'lex-card--marked' : ''}`}>
      <header className="lex-card-header sticky-entry">
        <div>
          <p className="entry-word">{cleanWord}</p>
          {entry.partOfSpeech && (
            <p className="entry-pos">{Array.isArray(entry.partOfSpeech) ? entry.partOfSpeech.join(' / ') : entry.partOfSpeech}</p>
          )}
        </div>
        <div className="meta-right">
          <button
            type="button"
            className="lex-card-dismiss"
            onClick={onToggleMark}
            aria-label={isMarked ? '연습 대상에서 제거' : '이 단어를 문제 섹션에 추가'}
            title={isMarked ? '연습 대상에서 제거' : '이 단어를 문제 섹션에 추가'}
          >
            ✕
          </button>
        </div>
      </header>

      {/* X로 표시된 단어는 단어만 보여 주고 나머지 섹션은 숨긴다 */}
      {isMarked && (
        <div className="lex-card-marked-note">
          <p>이 단어는 문제 섹션에서 연습용으로 선택되었습니다.</p>
        </div>
      )}

      {!isMarked && (
        <>
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

            {settings.showNuance && entry.nuanceRegister && (
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
              <p className="concept concept--compact" dangerouslySetInnerHTML={{ __html: formatConceptText(entry.concept) }} />
            </div>
          )}

          <div className="meaning-column">
            <p className="label">주요 뜻</p>
            <MeaningList
              meanings={entry.meanings}
              limit={settings.meaningLimit}
              showKorean={settings.showKoreanMeanings}
              blurBasicMeanings={settings.blurBasicMeanings}
            />
          </div>

          {settings.showRelations && (
            <div className="relation-column">
              <p className="label">단어 관계</p>
              <div className="relation-stack">
                <PillList
                  label="파생어"
                  items={entry.derivatives}
                  showMeaning={settings.showKoreanMeanings}
                  hiddenWords={hiddenRelationWords}
                  onWordClick={onToggleRelationWord}
                />
                <PillList
                  label="관련어"
                  items={entry.related}
                  showMeaning={settings.showKoreanMeanings}
                  hiddenWords={hiddenRelationWords}
                  onWordClick={onToggleRelationWord}
                />
                <PillList
                  label="동의어"
                  items={entry.synonyms}
                  showMeaning={settings.showKoreanMeanings}
                  hiddenWords={hiddenRelationWords}
                  onWordClick={onToggleRelationWord}
                />
                <PillList
                  label="유사어"
                  items={entry.nearSynonyms}
                  showMeaning={settings.showKoreanMeanings}
                  hiddenWords={hiddenRelationWords}
                  onWordClick={onToggleRelationWord}
                />
                <PillList
                  label="반의어"
                  items={entry.antonyms}
                  showMeaning={settings.showKoreanMeanings}
                  hiddenWords={hiddenRelationWords}
                  onWordClick={onToggleRelationWord}
                />
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
              <p className="body-text" dangerouslySetInnerHTML={{ __html: formatTextWithBold(entry.semanticExtension || '의미 확장 정보 없음') }} />
            </div>
            <div>
              <p className="label">추가 노트</p>
              {entry.studyTips ? <p className="body-text" dangerouslySetInnerHTML={{ __html: formatTextWithBold(entry.studyTips) }} /> : <p className="muted">추가 학습 노트가 없습니다.</p>}
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
              <p dangerouslySetInnerHTML={{ __html: formatTextWithBold(entry.morphology || '—') }} />
              <p className="label">어원·역사적 변천</p>
              <p dangerouslySetInnerHTML={{ __html: formatTextWithBold(entry.etymology || '—') }} />
            </div>
            <div>
              <p className="label">전치사 패턴 · 보어</p>
              <PrepositionPatternList
                patterns={entry.prepositionPatterns}
                blurBasicMeanings={settings.blurBasicMeanings}
              />
              <div className="required-complements">
                <p className="label">필수 보어</p>
                {entry.requiredComplements?.length ? (
                  <ul className="simple-list">
                    {entry.requiredComplements.map((item, index) => (
                      <li key={`${item}-${index}`} dangerouslySetInnerHTML={{ __html: formatTextWithBold(item) }} />
                    ))}
                  </ul>
                ) : (
                  <p className="muted">필수 보어 정보가 없습니다.</p>
                )}
              </div>
              <p className="label">문법적 특징</p>
              <p dangerouslySetInnerHTML={{ __html: formatTextWithBold(entry.grammarNotes || '—') }} />
              <p className="label">자동사 / 타동사</p>
              <p dangerouslySetInnerHTML={{ __html: formatTextWithBold(entry.transitivity || '—') }} />
              <p className="label">가산 / 불가산</p>
              <p dangerouslySetInnerHTML={{ __html: formatTextWithBold(entry.countability || '—') }} />
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
          {settings.showCollocations && (
            <div>
              <p className="label">콜로케이션</p>
              <CollocationList
                groups={filteredCollocations}
                showKorean={settings.showKoreanMeanings}
                limitPerLevel={settings.collocationLimitPerLevel}
                blurContextMeanings={settings.blurContextMeanings}
              />
            </div>
          )}
          {settings.showExamples && (
            <div>
              <p className="label">예문</p>
              <ExampleList
                examples={filteredExamples}
                showKorean={settings.showKoreanMeanings}
                limitPerLevel={settings.exampleLimitPerLevel}
                blurContextMeanings={settings.blurContextMeanings}
              />
            </div>
          )}
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
            blurBasicMeanings={settings.blurBasicMeanings}
          />
        </Section>
      )}
        </>
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
  const [markedWords, setMarkedWords] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem('lexicon-marked-words');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [excludedWords, setExcludedWords] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem('lexicon-excluded-words');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [hiddenRelationWords, setHiddenRelationWords] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem('lexicon-hidden-relation-words');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // 글자 크기 적용
  useEffect(() => {
    const scale = settings.fontScale || 1;
    document.documentElement.style.setProperty('--font-scale', scale);
  }, [settings.fontScale]);

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

  const handleResetSettings = () => {
    const reset = cloneDefaultSettings();
    setSettings(reset);
    setActivePreset('');
    setPracticeSeed(Date.now());
    setChunkIndex(0);
    setCurrentPage(1);
    setViewMode('words');
  };

  useEffect(() => {
    writeCookie(SETTINGS_COOKIE, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    writeCookie(PRESET_COOKIE, activePreset || '');
  }, [activePreset]);

  useEffect(() => {
    writeCookie(CUSTOM_PRESET_COOKIE, JSON.stringify(customPresets));
  }, [customPresets]);

  // X로 표시한 단어 목록을 localStorage에 저장
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('lexicon-marked-words', JSON.stringify(markedWords));
    } catch {
      // ignore
    }
  }, [markedWords]);

  // 제외된 단어 목록을 localStorage에 저장
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('lexicon-excluded-words', JSON.stringify(excludedWords));
    } catch {
      // ignore
    }
  }, [excludedWords]);

  // 단어 관계에서 숨긴 단어 목록을 localStorage에 저장
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('lexicon-hidden-relation-words', JSON.stringify(hiddenRelationWords));
    } catch {
      // ignore
    }
  }, [hiddenRelationWords]);

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

  // 단어 모드에서는 markedWords나 excludedWords에 있는 단어는 필터링
  const filteredEntries = useMemo(() => {
    const markedSet = new Set(markedWords);
    const excludedSet = new Set(excludedWords);
    return entries.filter((entry) => {
      const key = String(entry.word || '').toLowerCase();
      return key && !markedSet.has(key) && !excludedSet.has(key);
    });
  }, [entries, markedWords, excludedWords]);

  const chunkCount = Math.max(1, Math.ceil(filteredEntries.length / CHUNK_SIZE));

  useEffect(() => {
    if (chunkIndex > chunkCount - 1) {
      setChunkIndex(chunkCount - 1);
    }
  }, [chunkIndex, chunkCount]);
  const chunkStart = clamp(chunkIndex * CHUNK_SIZE, 0, Math.max(0, filteredEntries.length - 1));
  const chunkEnd = Math.min(filteredEntries.length, chunkStart + CHUNK_SIZE);
  const chunkEntries = useMemo(() => {
    return filteredEntries.slice(chunkStart, chunkEnd);
  }, [filteredEntries, chunkStart, chunkEnd]);
  const chunkRangeStart = filteredEntries.length ? chunkStart + 1 : 0;
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
    () => {
      if (!markedWords.length) return [];
      const markedSet = new Set(markedWords);
      const excludedSet = new Set(excludedWords);
      const sourceEntries = entries.filter((entry) => {
        const key = String(entry.word || '').toLowerCase();
        return key && markedSet.has(key) && !excludedSet.has(key);
      });
      if (!sourceEntries.length) return [];
      return buildPracticeQuestions(sourceEntries, settings, practiceSeed);
    },
    [entries, markedWords, excludedWords, settings, practiceSeed, viewMode]
  );

  const handlePageChange = (nextPage) => {
    const page = Math.min(Math.max(nextPage, 1), totalPages);
    setCurrentPage(page);
  };

  const handleChunkChange = (nextChunk) => {
    const safeChunk = clamp(nextChunk, 1, chunkCount) - 1;
    setChunkIndex(safeChunk);
    setCurrentPage(1);
  };

  const handleViewChange = (nextView) => {
    setViewMode(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 단어 모드에서 X를 누를 때: markedWords에 추가 (문제 모드에만 표시)
  const handleToggleMarkWord = (word) => {
    const key = String(word || '').toLowerCase();
    if (!key) return;
    setMarkedWords((prev) => {
      if (prev.includes(key)) {
        return prev.filter((item) => item !== key);
      }
      return [...prev, key];
    });
  };

  // 문제 모드에서 X를 누를 때: markedWords에서 제거하고 excludedWords에 추가 (완전히 제거)
  const handleExcludeWord = (word) => {
    const key = String(word || '').toLowerCase();
    if (!key) return;
    setMarkedWords((prev) => prev.filter((item) => item !== key));
    setExcludedWords((prev) => {
      if (prev.includes(key)) return prev;
      return [...prev, key];
    });
  };

  // 단어 관계에서 단어를 클릭하여 숨기기/보이기 토글
  const handleToggleRelationWord = (wordKey) => {
    if (!wordKey) return;
    setHiddenRelationWords((prev) => {
      if (prev.includes(wordKey)) {
        return prev.filter((item) => item !== wordKey);
      }
      return [...prev, wordKey];
    });
  };

  return (
    <div className="lex-page">
      <nav className="transfer-hub-nav" aria-label="편입 허브">
        <a className="transfer-hub-back" href={hrefToTransferPage('hub')}>
          ← 편입 허브
        </a>
      </nav>
      <header className="lex-topbar">
        <div className="topbar-title">
          <p className="eyebrow">편입 단어 · Lexicon Lab</p>
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
          <div className="font-size-control">
            <label htmlFor="fontScaleTop">크기</label>
            <input
              id="fontScaleTop"
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={settings.fontScale || 1}
              onChange={(e) => {
                const scale = Number(e.target.value);
                setSettings({ ...settings, fontScale: scale });
              }}
              style={{ width: '100px' }}
            />
            <span className="font-size-value">{Math.round((settings.fontScale || 1) * 100)}%</span>
          </div>
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

            {visibleEntries.map((entry) => {
              const key = String(entry.word || '').toLowerCase();
              const isMarked = markedWords.includes(key);
              return (
                <LexiconEntry
                  key={entry.word}
                  entry={entry}
                  settings={settings}
                  isMarked={isMarked}
                  onToggleMark={() => handleToggleMarkWord(entry.word)}
                  hiddenRelationWords={hiddenRelationWords}
                  onToggleRelationWord={handleToggleRelationWord}
                />
              );
            })}

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={handlePageChange}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={chunkEntries.length}
              sticky
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
            rangeLabel={markedWords.length ? `X로 표시한 ${markedWords.length}개 단어에서만 출제됩니다.` : '아직 X로 표시한 단어가 없습니다.'}
            onToggleMark={handleExcludeWord}
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
        onChange={setSettings}
        onClose={() => setPanelOpen(false)}
        activePreset={activePreset}
        onPresetApply={handlePresetApply}
        customPresets={customPresets}
        onSaveCustomPreset={handleSaveCustomPreset}
        onApplyCustomPreset={handleApplyCustomPreset}
        onReset={handleResetSettings}
      />
    </div>
  );
}
