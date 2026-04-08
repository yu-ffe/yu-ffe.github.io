/** 편입 학습 허브와 하위 페이지 간 이동용 쿼리 키 */

export const TRANSFER_PAGES = {
  hub: 'transfer-hub',
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
