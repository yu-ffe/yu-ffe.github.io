/**
 * 미분 퀴즈 문제 풀. 각 항목은 같은 category 안에서 오답 후보를 뽑는 데 쓰인다.
 */

export const CATEGORIES = {
  trig: { id: 'trig', label: '삼각함수' },
  invTrig: { id: 'invTrig', label: '역삼각' },
  hyp: { id: 'hyp', label: '쌍곡선' },
  invHyp: { id: 'invHyp', label: '역쌍곡선' },
};

/** @typedef {{ category: keyof typeof CATEGORIES, expr: string, answer: string }} DerivItem */

/** @type {DerivItem[]} */
export const DERIVATIVES = [
  // 삼각 6
  { category: 'trig', expr: 'sin x', answer: 'cos x' },
  { category: 'trig', expr: 'cos x', answer: '−sin x' },
  { category: 'trig', expr: 'tan x', answer: 'sec² x' },
  { category: 'trig', expr: 'cot x', answer: '−csc² x' },
  { category: 'trig', expr: 'sec x', answer: 'sec x · tan x' },
  { category: 'trig', expr: 'csc x', answer: '−csc x · cot x' },
  // 역삼각 6
  { category: 'invTrig', expr: 'arcsin x', answer: '1 / √(1 − x²)' },
  { category: 'invTrig', expr: 'arccos x', answer: '−1 / √(1 − x²)' },
  { category: 'invTrig', expr: 'arctan x', answer: '1 / (1 + x²)' },
  { category: 'invTrig', expr: 'arccot x', answer: '−1 / (1 + x²)' },
  { category: 'invTrig', expr: 'arcsec x', answer: '1 / (|x| · √(x² − 1))' },
  { category: 'invTrig', expr: 'arccsc x', answer: '−1 / (|x| · √(x² − 1))' },
  // 쌍곡 6
  { category: 'hyp', expr: 'sinh x', answer: 'cosh x' },
  { category: 'hyp', expr: 'cosh x', answer: 'sinh x' },
  { category: 'hyp', expr: 'tanh x', answer: 'sech² x' },
  { category: 'hyp', expr: 'coth x', answer: '−csch² x' },
  { category: 'hyp', expr: 'sech x', answer: '−sech x · tanh x' },
  { category: 'hyp', expr: 'csch x', answer: '−csch x · coth x' },
  // 역쌍곡 6
  { category: 'invHyp', expr: 'arsinh x', answer: '1 / √(1 + x²)' },
  { category: 'invHyp', expr: 'arcosh x', answer: '1 / √(x² − 1)' },
  { category: 'invHyp', expr: 'artanh x', answer: '1 / (1 − x²)' },
  { category: 'invHyp', expr: 'arcoth x', answer: '1 / (1 − x²)' },
  { category: 'invHyp', expr: 'arsech x', answer: '−1 / (x · √(1 − x²))' },
  { category: 'invHyp', expr: 'arcsch x', answer: '−1 / (|x| · √(1 + x²))' },
];

export function itemsByCategory(categoryId) {
  if (categoryId === 'all') return [...DERIVATIVES];
  return DERIVATIVES.filter((d) => d.category === categoryId);
}

function shuffleInPlace(arr, rng = Math.random) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 정답 + 같은 category의 다른 식들의 도함수 문자열을 섞어 4지선다 생성.
 */
export function buildChoices(item, allInCategory, choiceCount = 4) {
  const answers = allInCategory.map((d) => d.answer);
  const uniqueWrong = [...new Set(answers.filter((a) => a !== item.answer))];
  shuffleInPlace(uniqueWrong);
  const need = Math.min(choiceCount - 1, uniqueWrong.length);
  const wrongPick = uniqueWrong.slice(0, need);
  const pool = [item.answer, ...wrongPick];
  shuffleInPlace(pool);
  return pool;
}

export function randomItem(items, rng = Math.random) {
  if (!items.length) return null;
  return items[Math.floor(rng() * items.length)];
}
