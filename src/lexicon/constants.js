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
  blurKoreanMeanings: false,
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
      showNuance: false,
      showCollocations: false,
      showExamples: false,
      showQuiz: false,
      showWordSection: true,
      showPracticeSection: false,
      blurQuizAnswers: false,
      collocationLimitPerLevel: null,
      exampleLimitPerLevel: null,
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
      showFormDetails: false,
      showNuance: false,
      showCollocations: true,
      showExamples: true,
      showQuiz: false,
      showWordSection: true,
      showPracticeSection: true,
      blurQuizAnswers: false,
      collocationLimitPerLevel: 1,
      exampleLimitPerLevel: 1,
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
      showUsageContext: false,
      showFormDetails: false,
      showNuance: false,
      showCollocations: true,
      showExamples: true,
      showQuiz: true,
      showWordSection: true,
      showPracticeSection: true,
      blurQuizAnswers: true,
      collocationLimitPerLevel: null,
      exampleLimitPerLevel: null,
    },
    selectedPracticeModules: [
      'meaningRecall',
      'sentenceTranslation',
      'preposition',
      'contextMeaning',
      'naturalness',
      'wrongCombination',
    ],
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
      showNuance: true,
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
