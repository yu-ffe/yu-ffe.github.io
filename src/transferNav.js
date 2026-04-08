/**
 * 편입 학습 허브와 하위 페이지 간 이동용 쿼리 키.
 * 새 기능·UI에서는 `lexiconLab` 키를 쓰지 말 것(Lexicon Lab 폐기 보존용).
 */

export const TRANSFER_PAGES = {
  hub: 'transfer-hub',
  /** @deprecated Lexicon Lab — 폐기 보존용 URL만. 네비·허브에 연결하지 말 것. */
  lexiconLab: 'lexicon-lab',
  mathLab: 'math-lab',
  wordStudy: 'word-study',
};

/**
 * @param {keyof typeof TRANSFER_PAGES} key
 * @returns {string} 예: `?page=transfer-hub`
 */
export function hrefToTransferPage(key) {
  const page = TRANSFER_PAGES[key];
  if (!page) return `?page=${TRANSFER_PAGES.hub}`;
  return `?page=${page}`;
}
