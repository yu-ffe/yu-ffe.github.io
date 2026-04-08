import { useCallback, useEffect, useMemo, useState } from 'react';
import './LexiconLab.css';
import './MathLab.css';
import {
  CATEGORIES,
  buildChoices,
  buildChoicesReverse,
  itemsByCategory,
  randomItem,
} from './math/derivativeQuizData.js';
import { hrefToTransferPage } from './transferNav.js';
import './transferHubNav.css';

const CATEGORY_ORDER = ['all', 'trig', 'invTrig', 'hyp', 'invHyp'];

const QUIZ_MODES = [
  { id: 'forward', label: '미분', hint: 'f → f′' },
  { id: 'reverse', label: '원함수', hint: 'f′ → f' },
  { id: 'mixed', label: '혼합', hint: '문제마다 무작위' },
];

function useQuizSession(categoryFilter, quizMode) {
  const [round, setRound] = useState(() => ({
    item: null,
    choices: [],
    direction: null,
  }));
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const pool = useMemo(() => itemsByCategory(categoryFilter), [categoryFilter]);

  useEffect(() => {
    setStats({ correct: 0, total: 0 });
  }, [categoryFilter, quizMode]);

  const draw = useCallback(() => {
    const item = randomItem(pool);
    if (!item) {
      setRound({ item: null, choices: [], direction: null });
      return;
    }
    const inCat = itemsByCategory(item.category);
    const direction =
      quizMode === 'forward'
        ? 'forward'
        : quizMode === 'reverse'
          ? 'reverse'
          : Math.random() < 0.5
            ? 'forward'
            : 'reverse';
    const choices =
      direction === 'forward'
        ? buildChoices(item, inCat, 4)
        : buildChoicesReverse(item, inCat, 4);
    setRound({ item, choices, direction });
    setSelected(null);
  }, [pool, quizMode]);

  useEffect(() => {
    draw();
  }, [draw]);

  const pick = useCallback(
    (index) => {
      if (selected !== null || !round.item || !round.direction) return;
      setSelected(index);
      const expected =
        round.direction === 'forward' ? round.item.answer : round.item.expr;
      const correct = round.choices[index] === expected;
      setStats((s) => ({
        correct: s.correct + (correct ? 1 : 0),
        total: s.total + 1,
      }));
    },
    [selected, round.item, round.choices, round.direction]
  );

  const next = useCallback(() => {
    draw();
  }, [draw]);

  const resetStats = useCallback(() => {
    setStats({ correct: 0, total: 0 });
    draw();
  }, [draw]);

  return { round, selected, stats, pick, next, resetStats, pool };
}

export default function MathLab() {
  const [quizMode, setQuizMode] = useState('forward');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { round, selected, stats, pick, next, resetStats, pool } = useQuizSession(
    categoryFilter,
    quizMode
  );

  const expected =
    round.item && round.direction
      ? round.direction === 'forward'
        ? round.item.answer
        : round.item.expr
      : null;

  const isCorrect =
    selected !== null && expected !== null && round.choices[selected] === expected;

  const showTypeBadge = quizMode === 'mixed' && round.direction;

  return (
    <div className="lex-page math-lab-root">
      <nav className="transfer-hub-nav" aria-label="편입 허브">
        <a className="transfer-hub-back" href={hrefToTransferPage('hub')}>
          ← 편입 허브
        </a>
      </nav>
      <header className="lex-topbar">
        <div className="topbar-title">
          <h1>Math Lab</h1>
          <p className="subtitle">미분 공식 퀴즈 · 모바일 터치에 맞춤</p>
        </div>
      </header>

      <div className="math-settings-stack">
        <div className="math-category-row source-selector">
          <p className="source-label">문제 유형</p>
          <div className="source-buttons" role="tablist" aria-label="미분 또는 원함수 문제">
            {QUIZ_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                title={m.hint}
                aria-selected={quizMode === m.id}
                className={`source-chip ${quizMode === m.id ? 'active' : ''}`}
                onClick={() => setQuizMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="math-mode-hint">{QUIZ_MODES.find((x) => x.id === quizMode)?.hint}</p>
        </div>

        <div className="math-category-row source-selector">
          <p className="source-label">범위</p>
          <div className="source-buttons" role="tablist" aria-label="문제 범위">
            {CATEGORY_ORDER.map((id) => {
              const label = id === 'all' ? '전체' : CATEGORIES[id]?.label ?? id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={categoryFilter === id}
                  className={`source-chip ${categoryFilter === id ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(id)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="math-stats" aria-live="polite">
        <span>
          정답 <strong>{stats.correct}</strong> / {stats.total}
        </span>
        {stats.total > 0 && (
          <span>
            정답률 <strong>{Math.round((stats.correct / stats.total) * 100)}%</strong>
          </span>
        )}
      </div>

      {!pool.length && (
        <article className="lex-card">
          <p className="muted">이 범위에 문제가 없습니다.</p>
        </article>
      )}

      {round.item && round.direction && (
        <article className="lex-card">
          <div className="math-question-block">
            {showTypeBadge && (
              <p
                className={`math-type-badge math-type-badge--${round.direction}`}
                aria-label={round.direction === 'forward' ? '미분 문제' : '원함수 문제'}
              >
                {round.direction === 'forward' ? '미분' : '원함수'}
              </p>
            )}
            {round.direction === 'forward' ? (
              <>
                <p className="math-question-label">도함수 구하기</p>
                <p className="math-question">
                  <span className="math-dd">d/dx</span> ({round.item.expr}) = ?
                </p>
              </>
            ) : (
              <>
                <p className="math-question-label">원함수 찾기</p>
                <p className="math-question math-question--reverse">
                  <span className="math-dd">f′(x)</span> = {round.item.answer}
                </p>
                <p className="math-question-follow">일 때 <span className="math-dd">f(x)</span>는?</p>
              </>
            )}
          </div>

          <div className="math-options" role="group" aria-label="보기">
            {round.choices.map((choice, index) => {
              const revealed = selected !== null;
              const isThisCorrect = expected !== null && choice === expected;
              const isPicked = selected === index;
              let cls = 'math-option';
              if (revealed) {
                if (isThisCorrect) cls += ' reveal-correct';
                else if (isPicked) cls += ' reveal-wrong';
                else cls += ' dimmed';
              }
              return (
                <button
                  key={`${round.item.expr}-${round.direction}-${index}`}
                  type="button"
                  className={cls}
                  disabled={revealed}
                  onClick={() => pick(index)}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <>
              <p className="math-hint" role="status">
                {isCorrect ? '정답입니다.' : '오답입니다. 초록색이 정답입니다.'}
              </p>
              <div className="math-actions">
                <button type="button" className="ghost" onClick={next}>
                  다음 문제
                </button>
                <button type="button" className="ghost subtle" onClick={resetStats}>
                  기록 초기화
                </button>
              </div>
            </>
          )}
        </article>
      )}
    </div>
  );
}
