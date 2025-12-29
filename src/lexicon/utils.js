import { PAGE_SIZE_OPTIONS, wordSourceLabels } from './constants.js';

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function normalizePageSize(value, options = PAGE_SIZE_OPTIONS) {
  const parsed = Number(value);
  if (options.includes(parsed)) return parsed;
  return options[0];
}

export function normalizeOptionalLimit(value) {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0) return parsed;
  return null;
}

export function getWordSourceKey(path) {
  return path.match(/\/words\/json\/([^/]+)\//)?.[1] ?? '';
}

export function getWordSourceLabel(source) {
  return wordSourceLabels[source] ?? source;
}

export function filterByLevel(groups, levels) {
  if (!groups?.length) return [];
  if (!levels?.length) return groups;
  return groups.filter((group) => levels.includes(group.level));
}

export function mulberry32(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let result = Math.imul(t ^ (t >>> 15), t | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleList(items, rng) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

export function pickOne(items, rng) {
  if (!items.length) return null;
  return items[Math.floor(rng() * items.length)];
}

export function maskWord(text, word) {
  if (!text || !word || typeof text !== 'string') return text;
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escaped}\\b`, 'gi');
  return text.replace(pattern, '_____');
}

export function flattenExamples(entry) {
  return entry.examples?.flatMap((group) => group.items?.map((item) => ({ ...item, level: group.level })) || []) || [];
}

export function buildPracticeQuestions(entries, settings, seed) {
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
