export const SETTINGS_COOKIE = 'lexiconLabSettings';
export const POSITION_COOKIE = 'lexiconLabPosition';
export const VIEW_COOKIE = 'lexiconLabView';
export const PRESET_COOKIE = 'lexiconLabPreset';
export const CUSTOM_PRESET_COOKIE = 'lexiconLabCustomPresets';

export const MAX_CUSTOM_PRESETS = 3;
// TODO: Remove MOBILE_PREVIEW once desktop view is restored.
export const MOBILE_PREVIEW = true;
export const CHUNK_SIZE = 100;
export const PAGE_SIZE_OPTIONS = [6, 8, 10, 12];

export const wordSourceLabels = {
  Transfer: 'Transfer · 편입',
  CSAT: 'CSAT · 수능',
};

export const defaultSettings = {
  showConcept: true,
  meaningLimit: 3,
  showClassification: true,
  showRelations: true,
  showUsageContext: true,
  showFormDetails: true,
  showNuance: true,
  showCollocations: true,
  showExamples: true,
  showQuiz: true,
  showKoreanMeanings: true,
  blurBasicMeanings: false,
  blurContextMeanings: false,
  showStickyWord: true,
  showStickyPos: true,
  blurQuizAnswers: true,
  quizBlurAmount: 8,
  collocationLimitPerLevel: null,
  exampleLimitPerLevel: null,
  selectedLevels: ['상', '중', '하'],
  quizItemLimit: 3,
  wordSource: 'all',
  showWordSection: true,
  showPracticeSection: true,
  practiceItemLimit: 8,
  fontScale: 1,
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

export const presetOptions = [
  {
    key: 'quick-review',
    label: '1. 빠른 복습',
    description: '단어와 기본 뜻만 보고 빠르게 복습할 때',
    settings: {
      showConcept: false,
      meaningLimit: 2,
      showClassification: false,
      showRelations: false,
      showUsageContext: false,
      showFormDetails: false,
      showNuance: false,
      showCollocations: false,
      showExamples: false,
      showQuiz: false,
      showWordSection: true,
      showPracticeSection: false,
      blurQuizAnswers: false,
      blurBasicMeanings: false,
      blurContextMeanings: false,
      collocationLimitPerLevel: null,
      exampleLimitPerLevel: null,
    },
    selectedPracticeModules: [],
  },
  {
    key: 'meaning-focus',
    label: '2. 뜻 집중 학습',
    description: '기본 뜻을 가리고 회상 연습, 문장/콜로케이션은 보기',
    settings: {
      showConcept: true,
      meaningLimit: 3,
      showClassification: true,
      showRelations: true,
      showUsageContext: false,
      showFormDetails: false,
      showNuance: false,
      showCollocations: false,
      showExamples: false,
      showQuiz: false,
      showWordSection: true,
      showPracticeSection: true,
      blurQuizAnswers: false,
      blurBasicMeanings: true,
      blurContextMeanings: false,
      collocationLimitPerLevel: 2,
      exampleLimitPerLevel: 2,
    },
    selectedPracticeModules: ['meaningRecall', 'sentenceTranslation'],
  },
  {
    key: 'context-practice',
    label: '3. 문맥 연습',
    description: '기본 뜻은 보이지만 문장/콜로케이션 뜻을 가려서 연습',
    settings: {
      showConcept: true,
      meaningLimit: 3,
      showClassification: true,
      showRelations: true,
      showUsageContext: false,
      showFormDetails: false,
      showNuance: false,
      showCollocations: true,
      showExamples: true,
      showQuiz: true,
      showWordSection: true,
      showPracticeSection: false,
      blurQuizAnswers: true,
      blurBasicMeanings: false,
      blurContextMeanings: true,
      collocationLimitPerLevel: null,
      exampleLimitPerLevel: null,
    },
    selectedPracticeModules: [],
  },
  {
    key: 'comprehensive',
    label: '4. 종합 학습',
    description: '모든 정보를 보되, 기본 뜻과 문맥 뜻 모두 가려서 완전 암기 모드',
    settings: {
      showConcept: true,
      meaningLimit: 5,
      showClassification: true,
      showRelations: true,
      showUsageContext: true,
      showFormDetails: true,
      showNuance: true,
      showCollocations: true,
      showExamples: true,
      showQuiz: true,
      showWordSection: true,
      showPracticeSection: true,
      blurQuizAnswers: true,
      blurBasicMeanings: true,
      blurContextMeanings: true,
      collocationLimitPerLevel: null,
      exampleLimitPerLevel: null,
    },
    selectedPracticeModules: defaultSettings.selectedPracticeModules,
  },
];

export const practiceModules = [
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

export function cloneDefaultSettings(base = defaultSettings) {
  return {
    ...base,
    selectedLevels: Array.isArray(base.selectedLevels) ? [...base.selectedLevels] : ['상', '중', '하'],
    selectedPracticeModules: Array.isArray(base.selectedPracticeModules)
      ? [...base.selectedPracticeModules]
      : [...defaultSettings.selectedPracticeModules],
  };
}
