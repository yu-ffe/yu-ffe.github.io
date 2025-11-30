const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const COLUMNS = [
  '단어', '품사', '주요 의미(핵심 뜻)', '핵심 개념 요약(한 문장)', '어원·역사적 변천',
  '의미 확장(현재 쓰임 포함)', '뉘앙스·레지스터', '문법적 특징', '자동사/타동사', '가산/불가산',
  '전치사 패턴', '필수 보어 등', '형태론적 분석(접두사·어근·접미사)', '파생어·관련어', '혼동 주의 단어',
  '동의어·유사어', '반의어', '콜로케이션(뜻 포함)', '예문(난이도별 2~3개)', '학습 팁',
  '교과/분야 태그', '빈도 정도(고/중/저)', '단어 난이도(1~10)', 'OX 체크용 문항(기본값 X)', '미니 퀴즈(3문항 선택형)',
];

const state = {
  entries: [],
  filtered: [],
};

document.addEventListener('DOMContentLoaded', () => {
  setupControls();
  loadAllCSVs();
});

function setupControls() {
  const searchInput = document.querySelector('#search');
  const posSelect = document.querySelector('#pos');
  const difficultySelect = document.querySelector('#difficulty');

  searchInput.addEventListener('input', () => applyFilters());
  posSelect.addEventListener('change', () => applyFilters());
  difficultySelect.addEventListener('change', () => applyFilters());
}

async function loadAllCSVs() {
  const all = [];
  for (const month of MONTHS) {
    try {
      const res = await fetch(`/assets/words/${month}.csv`, { cache: 'no-cache' });
      if (!res.ok) {
        continue;
      }
      const text = await res.text();
      const parsed = parseCSV(text);
      all.push(...parsed);
    } catch (error) {
      console.warn(`Failed to load ${month}.csv`, error);
    }
  }

  state.entries = all;
  applyFilters();
}

function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  const result = [];

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      rows.push(current.trim());
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (current.length > 0 || rows.length > 0) {
        rows.push(current.trim());
        if (rows.length === COLUMNS.length && rows[0] !== '단어') {
          result.push(buildEntry(rows));
        }
      }
      current = '';
      rows.length = 0;
      continue;
    }

    current += char;
  }

  if (current.length > 0 || rows.length > 0) {
    rows.push(current.trim());
    if (rows.length === COLUMNS.length && rows[0] !== '단어') {
      result.push(buildEntry(rows));
    }
  }

  return result;
}

function buildEntry(row) {
  return row.reduce((acc, value, idx) => {
    acc[COLUMNS[idx]] = value;
    return acc;
  }, {});
}

function applyFilters() {
  const search = document.querySelector('#search').value.toLowerCase();
  const pos = document.querySelector('#pos').value;
  const difficulty = document.querySelector('#difficulty').value;

  state.filtered = state.entries.filter((entry) => {
    const haystack = `${entry['단어']} ${entry['주요 의미(핵심 뜻)']} ${entry['핵심 개념 요약(한 문장)']} ${entry['예문(난이도별 2~3개)']}`.toLowerCase();
    const matchesSearch = haystack.includes(search);
    const matchesPos = pos ? entry['품사']?.toLowerCase().includes(pos) : true;
    const matchesDifficulty = difficulty ? entry['단어 난이도(1~10)'] === difficulty : true;
    return matchesSearch && matchesPos && matchesDifficulty;
  });

  render();
}

function render() {
  const grid = document.querySelector('#cards');
  const counter = document.querySelector('#counter');

  grid.innerHTML = '';
  counter.textContent = `${state.filtered.length}개 단어가 준비되어 있어요.`;

  if (state.filtered.length === 0) {
    grid.innerHTML = '<div class="empty">아직 불러온 단어가 없어요. CSV 파일을 확인해 주세요.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  state.filtered.forEach((entry) => fragment.appendChild(createCard(entry)));
  grid.appendChild(fragment);
}

function createCard(entry) {
  const card = document.createElement('article');
  card.className = 'card';

  const header = document.createElement('div');
  header.className = 'word-row';

  const title = document.createElement('h3');
  title.textContent = entry['단어'];
  header.appendChild(title);

  const pos = document.createElement('span');
  pos.className = 'tag';
  pos.textContent = entry['품사'];
  header.appendChild(pos);

  const meaning = document.createElement('p');
  meaning.className = 'meaning';
  meaning.textContent = entry['주요 의미(핵심 뜻)'];

  const summary = document.createElement('div');
  summary.className = 'summary';
  summary.innerHTML = `
    <span class="badge">빈도: <span class="highlight">${entry['빈도 정도(고/중/저)'] || '-'} </span></span>
    <span class="badge">난이도: <span class="highlight">${entry['단어 난이도(1~10)'] || '-'} </span></span>
    <span class="badge accent">태그: ${entry['교과/분야 태그'] || '미지정'}</span>
  `;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `
    <span>개념 요약: <strong>${entry['핵심 개념 요약(한 문장)'] || '-'}</strong></span>
    <span>어원: ${entry['어원·역사적 변천'] || '-'}</span>
    <span>의미 확장: ${entry['의미 확장(현재 쓰임 포함)'] || '-'}</span>
  `;

  const chips = document.createElement('ul');
  chips.className = 'chips';
  ['동의어·유사어', '반의어', '혼동 주의 단어', '파생어·관련어'].forEach((key) => {
    const value = entry[key];
    if (value) {
      value.split(/[,;]/).forEach((item) => {
        const chip = document.createElement('li');
        chip.className = 'chip';
        chip.textContent = `${key.replace(/·/g, '')}: ${item.trim()}`;
        chips.appendChild(chip);
      });
    }
  });

  const collocations = document.createElement('p');
  collocations.className = 'meaning';
  collocations.textContent = `콜로케이션: ${entry['콜로케이션(뜻 포함)'] || '-'}`;

  const examples = document.createElement('div');
  examples.className = 'examples';
  examples.textContent = entry['예문(난이도별 2~3개)'] || '예문이 아직 없어요.';

  const tips = document.createElement('p');
  tips.className = 'meaning';
  tips.textContent = `학습 팁: ${entry['학습 팁'] || '추가 팁을 채워 주세요.'}`;

  card.append(header, meaning, summary, meta, collocations, examples, tips, chips);
  return card;
}
