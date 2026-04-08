import { useCallback, useEffect, useMemo, useState } from 'react';
import './LexiconLab.css';
import './MathLab.css';
import {
  CATEGORIES,
  buildChoices,
  itemsByCategory,
  randomItem,
} from './math/derivativeQuizData.js';

const CATEGORY_ORDER = ['all', 'trig', 'invTrig', 'hyp', 'invHyp'];

function useQuizSession(categoryFilter) {
  const [round, setRound] = useState(() => ({
    item: null,
    choices: [],
  }));
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const pool = useMemo(() => itemsByCategory(categoryFilter), [categoryFilter]);

  useEffect(() => {
    setStats({ correct: 0, total: 0 });
  }, [categoryFilter]);

  const draw = useCallback(() => {
    const item = randomItem(pool);
    if (!item) {
      setRound({ item: null, choices: [] });
      return;
    }
    const inCat = itemsByCategory(item.category);
    const choices = buildChoices(item, inCat, 4);
    setRound({ item, choices });
    setSelected(null);
  }, [pool]);

  useEffect(() => {
    draw();
  }, [draw]);

  const pick = useCallback(
    (index) => {
      if (selected !== null || !round.item) return;
      setSelected(index);
      const correct = round.choices[index] === round.item.answer;
      setStats((s) => ({
        correct: s.correct + (correct ? 1 : 0),
        total: s.total + 1,
      }));
    },
    [selected, round.item, round.choices]
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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { round, selected, stats, pick, next, resetStats, pool } = useQuizSession(categoryFilter);

  const isCorrect =
    selected !== null && round.item && round.choices[selected] === round.item.answer;

  return (
    <div className="lex-page math-lab-root">
      <header className="lex-topbar">
        <div className="topbar-title">
          <h1>Math Lab</h1>
          <p className="subtitle">미분 공식 퀴즈 · 모바일 터치에 맞춤</p>
        </div>
      </header>

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

      <div className="math-stats" aria-live="polite">
        <span>
          정답 <strong>{stats.correct}</strong> / {stats.total}
        </span>
        {stats.total > 0 && (
          <span>
            정답률{' '}
            <strong>{Math.round((stats.correct / stats.total) * 100)}%</strong>
          </span>
        )}
      </div>

      {!pool.length && (
        <article className="lex-card">
          <p className="muted">이 범위에 문제가 없습니다.</p>
        </article>
      )}

      {round.item && (
        <article className="lex-card">
          <div className="math-question-block">
            <p className="math-question-label">다음을 구하시오</p>
            <p className="math-question">
              <span className="math-dd">d/dx</span> ({round.item.expr}) = ?
            </p>
          </div>

          <div className="math-options" role="group" aria-label="보기">
            {round.choices.map((choice, index) => {
              const revealed = selected !== null;
              const isThisCorrect = choice === round.item.answer;
              const isPicked = selected === index;
              let cls = 'math-option';
              if (revealed) {
                if (isThisCorrect) cls += ' reveal-correct';
                else if (isPicked) cls += ' reveal-wrong';
                else cls += ' dimmed';
              }
              return (
                <button
                  key={`${round.item.expr}-${index}`}
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
