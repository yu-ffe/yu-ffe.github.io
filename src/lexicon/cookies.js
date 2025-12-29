import {
  CUSTOM_PRESET_COOKIE,
  MAX_CUSTOM_PRESETS,
  POSITION_COOKIE,
  SETTINGS_COOKIE,
  VIEW_COOKIE,
  cloneDefaultSettings,
  defaultSettings,
} from './constants.js';
import { clamp, normalizeOptionalLimit, normalizePageSize } from './utils.js';

export function readCookie(name) {
  if (typeof document === 'undefined') return '';
  const value = document.cookie
    .split('; ')
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.split('=')[1]) : '';
}

export function readJsonCookie(name, fallback = null) {
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

export function writeCookie(name, value, days = 90) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export function normalizeCustomPresets(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_CUSTOM_PRESETS).map((preset, index) => ({
    key: preset?.key || `custom-${index}`,
    label: preset?.label || `커스텀 ${index + 1}`,
    settings: preset?.settings ? { ...preset.settings } : cloneDefaultSettings(),
    selectedPracticeModules:
      preset?.selectedPracticeModules ||
      preset?.settings?.selectedPracticeModules ||
      cloneDefaultSettings().selectedPracticeModules,
  }));
}

export function loadInitialSettings(savedSettings = {}) {
  const saved = Object.keys(savedSettings).length ? savedSettings : readJsonCookie(SETTINGS_COOKIE, {});
  const merged = {
    ...cloneDefaultSettings(defaultSettings),
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
  merged.selectedPracticeModules =
    Array.isArray(merged.selectedPracticeModules) && merged.selectedPracticeModules.length
      ? merged.selectedPracticeModules
      : [...defaultSettings.selectedPracticeModules];
  merged.collocationLimitPerLevel = normalizeOptionalLimit(merged.collocationLimitPerLevel);
  merged.exampleLimitPerLevel = normalizeOptionalLimit(merged.exampleLimitPerLevel);
  merged.showNuance = merged.showNuance !== false;
  merged.blurKoreanMeanings = merged.blurKoreanMeanings === true;
  merged.showWordSection = true;
  merged.showPracticeSection = true;

  return merged;
}

export function loadInitialViewState() {
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
