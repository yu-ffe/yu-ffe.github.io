/**
 * Calendar Widget (Embed-friendly)
 * - Query params:
 *   - api:    events API endpoint (e.g. https://example.com/events)
 *   - token:  optional bearer token
 *   - month:  YYYY-MM (initial month)
 *   - theme:  dark|light (light은 기본값만 살짝 변경; 필요하면 확장)
 *
 * API contract (권장):
 *  GET {api}?start=YYYY-MM-DD&end=YYYY-MM-DD
 *  Response: { events: [{ id, title, start, end, description, color }] }
 *   - start/end: ISO string (e.g. 2025-12-16T09:00:00+09:00 or 2025-12-16)
 */

(() => {
  const els = {
    monthLabel: document.getElementById("monthLabel"),
    subtitleLabel: document.getElementById("subtitleLabel"),
    daysGrid: document.getElementById("daysGrid"),
    panelDateLabel: document.getElementById("panelDateLabel"),
    panelMetaLabel: document.getElementById("panelMetaLabel"),
    eventsList: document.getElementById("eventsList"),
    hintLabel: document.getElementById("hintLabel"),

    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    todayBtn: document.getElementById("todayBtn"),
    refreshBtn: document.getElementById("refreshBtn"),
  };

  const qp = new URLSearchParams(location.search);
  const API_URL = (qp.get("api") || "").trim();
  const API_TOKEN = (qp.get("token") || "").trim();

  // (옵션) theme
  const theme = (qp.get("theme") || "dark").toLowerCase();
  if (theme === "light") {
    document.documentElement.style.setProperty("--bg", "#f6f7fb");
    document.documentElement.style.setProperty("--card", "#ffffff");
    document.documentElement.style.setProperty("--card2", "#f3f5f8");
    document.documentElement.style.setProperty("--text", "#101318");
    document.documentElement.style.setProperty("--muted", "rgba(16,19,24,.65)");
    document.documentElement.style.setProperty("--line", "rgba(16,19,24,.10)");
  }

  const toISODate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseMonthParam = (value) => {
    // YYYY-MM
    if (!value) return null;
    const m = value.match(/^(\d{4})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    if (mo < 0 || mo > 11) return null;
    return new Date(y, mo, 1);
  };

  const clampDay = (y, m, day) => {
    const last = new Date(y, m + 1, 0).getDate();
    return Math.min(day, last);
  };

  // State
  const state = {
    // viewMonth: month first day
    viewMonth: parseMonthParam(qp.get("month")) || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    selectedDate: null, // Date
    eventsByDate: new Map(), // "YYYY-MM-DD" -> Event[]
    lastFetchRange: null, // {start, end}
  };

  // Event 모델 (내부)
  // { id, title, start: Date|null, end: Date|null, description, color }
  function normalizeEvent(raw) {
    const safe = {
      id: String(raw?.id ?? cryptoRandomId()),
      title: String(raw?.title ?? "Untitled"),
      description: String(raw?.description ?? ""),
      color: String(raw?.color ?? ""), // optional
      start: null,
      end: null,
    };

    const s = raw?.start;
    const e = raw?.end;

    // Date only or ISO
    if (s) safe.start = new Date(s);
    if (e) safe.end = new Date(e);

    // invalid guard
    if (safe.start && isNaN(safe.start.getTime())) safe.start = null;
    if (safe.end && isNaN(safe.end.getTime())) safe.end = null;

    return safe;
  }

  function cryptoRandomId() {
    // 간단 ID
    return "evt_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
  }

  function monthRange(viewMonth) {
    const start = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const end = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
    return { start, end };
  }

  function buildCalendarCells(viewMonth) {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);

    // 일요일 시작(0)
    const startDow = first.getDay();
    const totalDays = last.getDate();

    // 앞쪽 채움: 이전 달
    const prevLast = new Date(y, m, 0).getDate();

    const cells = [];
    for (let i = 0; i < startDow; i++) {
      const dayNum = prevLast - (startDow - 1 - i);
      const d = new Date(y, m - 1, dayNum);
      cells.push({ date: d, inMonth: false });
    }
    // 이번 달
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ date: new Date(y, m, d), inMonth: true });
    }
    // 뒤쪽 채움: 다음 달 (42칸(6주) 고정)
    while (cells.length % 7 !== 0) {
      const nextDay = cells.length - (startDow + totalDays) + 1;
      const d = new Date(y, m + 1, nextDay);
      cells.push({ date: d, inMonth: false });
    }
    // 5주/6주 고정: 42칸
    if (cells.length < 42) {
      const needed = 42 - cells.length;
      const base = cells[cells.length - 1].date;
      for (let i = 1; i <= needed; i++) {
        cells.push({ date: new Date(base.getFullYear(), base.getMonth(), base.getDate() + i), inMonth: false });
      }
    }
    if (cells.length > 42) cells.length = 42;

    return cells;
  }

  function formatMonthTitle(d) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return `${y}년 ${m}월`;
  }

  function formatSubtitle(range) {
    return `${toISODate(range.start)} ~ ${toISODate(range.end)}`;
  }

  function formatDateLabel(d) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const dow = ["일","월","화","수","목","금","토"][d.getDay()];
    return `${y}-${String(m).padStart(2,"0")}-${String(day).padStart(2,"0")} (${dow})`;
  }

  function timeText(evt) {
    // 종일(날짜만) 이벤트 처리: 시간이 없으면 "종일"
    if (!evt.start) return "—";
    const h = evt.start.getHours();
    const min = evt.start.getMinutes();
    const hasTime = !(h === 0 && min === 0 && (typeof evt._dateOnly === "boolean" ? evt._dateOnly : false));

    // date-only 판단(ISO가 YYYY-MM-DD만 오는 경우 JS Date는 로컬 00:00)
    // 더 정확히 하려면 서버에서 isAllDay 보내는 걸 권장
    if (!evt.end && evt.start && h === 0 && min === 0) return "종일";

    const hh = String(h).padStart(2, "0");
    const mm = String(min).padStart(2, "0");
    if (evt.end) {
      const eh = String(evt.end.getHours()).padStart(2, "0");
      const em = String(evt.end.getMinutes()).padStart(2, "0");
      return `${hh}:${mm} ~ ${eh}:${em}`;
    }
    return hasTime ? `${hh}:${mm}` : "종일";
  }

  function setHint(text, danger = false) {
    els.hintLabel.textContent = text || "";
    els.hintLabel.style.color = danger ? "var(--danger)" : "var(--muted)";
  }

  function clearEvents() {
    state.eventsByDate.clear();
  }

  function addEventToMap(evt) {
    // start가 없으면 표시 어려움 → 스킵(또는 정책에 맞게 처리)
    if (!evt.start) return;

    // 이벤트가 여러 날에 걸친 경우를 고려해 날짜별로 분배
    const startDate = new Date(evt.start.getFullYear(), evt.start.getMonth(), evt.start.getDate());
    const endDate = evt.end
      ? new Date(evt.end.getFullYear(), evt.end.getMonth(), evt.end.getDate())
      : startDate;

    const cur = new Date(startDate);
    while (cur <= endDate) {
      const key = toISODate(cur);
      if (!state.eventsByDate.has(key)) state.eventsByDate.set(key, []);
      state.eventsByDate.get(key).push(evt);
      cur.setDate(cur.getDate() + 1);
    }
  }

  function sortEvents(list) {
    return list.slice().sort((a, b) => {
      const at = a.start ? a.start.getTime() : 0;
      const bt = b.start ? b.start.getTime() : 0;
      return at - bt;
    });
  }

  async function fetchEventsForCurrentMonth() {
    clearEvents();
    if (!API_URL) {
      // 데모 이벤트(옵션): API 없을 때도 UI 확인 가능
      seedDemoEvents();
      return;
    }

    const range = monthRange(state.viewMonth);

    // API는 달력 표시 범위(앞뒤 채움 포함)로 땡기고 싶으면 여기서 range 확장 가능
    const start = toISODate(range.start);
    const end = toISODate(range.end);

    state.lastFetchRange = { start, end };

    setHint("일정 불러오는 중…");

    try {
      const url = new URL(API_URL);
      url.searchParams.set("start", start);
      url.searchParams.set("end", end);

      const headers = { "Accept": "application/json" };
      if (API_TOKEN) headers["Authorization"] = `Bearer ${API_TOKEN}`;

      const res = await fetch(url.toString(), { method: "GET", headers, mode: "cors" });
      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);

      const data = await res.json();
      const rawEvents = Array.isArray(data?.events) ? data.events : Array.isArray(data) ? data : [];

      rawEvents.map(normalizeEvent).forEach(addEventToMap);

      setHint(`불러옴: ${rawEvents.length}개`);
    } catch (err) {
      console.error(err);
      setHint(`API 연동 실패: ${String(err.message || err)}`, true);
      // 실패해도 데모로 UI는 보이게 하고 싶으면 아래 주석 해제
      // seedDemoEvents();
    }
  }

  function seedDemoEvents() {
    const y = state.viewMonth.getFullYear();
    const m = state.viewMonth.getMonth();
    const demo = [
      { id: "d1", title: "데모: 작업 계획", start: new Date(y, m, 3, 10, 0).toISOString(), end: new Date(y, m, 3, 11, 0).toISOString(), description: "API 연결 전 UI 확인용" },
      { id: "d2", title: "데모: 미팅", start: new Date(y, m, 12, 14, 30).toISOString(), end: new Date(y, m, 12, 15, 0).toISOString(), description: "노션 임베드 테스트" },
      { id: "d3", title: "데모: 마감", start: new Date(y, m, 22).toISOString(), description: "종일 이벤트 예시" },
    ];
    demo.map(normalizeEvent).forEach(addEventToMap);
    setHint("API 미설정: 데모 일정 표시 중");
  }

  function render() {
    const range = monthRange(state.viewMonth);
    els.monthLabel.textContent = formatMonthTitle(state.viewMonth);
    els.subtitleLabel.textContent = formatSubtitle(range);

    const cells = buildCalendarCells(state.viewMonth);
    const todayKey = toISODate(new Date());
    const selectedKey = state.selectedDate ? toISODate(state.selectedDate) : null;

    els.daysGrid.innerHTML = "";

    cells.forEach(({ date, inMonth }) => {
      const key = toISODate(date);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cw__day" + (inMonth ? "" : " cw__day--muted");
      btn.dataset.date = key;

      if (key === todayKey) btn.classList.add("cw__day--today");
      if (selectedKey && key === selectedKey) btn.classList.add("cw__day--selected");

      const num = document.createElement("div");
      num.className = "cw__dayNum";
      num.textContent = String(date.getDate());

      btn.appendChild(num);

      const evts = state.eventsByDate.get(key) || [];
      if (evts.length > 0) {
        const dots = document.createElement("div");
        dots.className = "cw__dots";

        // 최대 3개 점만 표시
        const count = Math.min(3, evts.length);
        for (let i = 0; i < count; i++) {
          const dot = document.createElement("span");
          dot.className = "cw__dot" + (i === 1 ? " cw__dot--2" : i === 2 ? " cw__dot--3" : "");
          dots.appendChild(dot);
        }
        btn.appendChild(dots);
      }

      btn.addEventListener("click", () => onSelectDate(key));
      els.daysGrid.appendChild(btn);
    });

    // 패널도 갱신
    if (state.selectedDate) renderDayPanel(state.selectedDate);
  }

  function renderDayPanel(dateObj) {
    const key = toISODate(dateObj);
    els.panelDateLabel.textContent = formatDateLabel(dateObj);

    const list = sortEvents(state.eventsByDate.get(key) || []);
    els.panelMetaLabel.textContent = list.length ? `${list.length}개 일정` : "일정 없음";

    if (list.length === 0) {
      els.eventsList.innerHTML = `<div class="cw__empty">이 날짜에는 일정이 없습니다.</div>`;
      return;
    }

    els.eventsList.innerHTML = "";
    list.forEach((evt) => {
      const item = document.createElement("div");
      item.className = "cw__event";

      const t = document.createElement("div");
      t.className = "cw__eventTime";
      t.textContent = timeText(evt);

      const body = document.createElement("div");
      const title = document.createElement("div");
      title.className = "cw__eventTitle";
      title.textContent = evt.title;

      const desc = document.createElement("div");
      desc.className = "cw__eventDesc";
      desc.textContent = evt.description || "";

      body.appendChild(title);
      if (evt.description) body.appendChild(desc);

      item.appendChild(t);
      item.appendChild(body);

      els.eventsList.appendChild(item);
    });
  }

  function onSelectDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    state.selectedDate = new Date(y, m - 1, d);
    render();
    renderDayPanel(state.selectedDate);
  }

  function goMonth(delta) {
    const y = state.viewMonth.getFullYear();
    const m = state.viewMonth.getMonth();
    const day = state.selectedDate ? state.selectedDate.getDate() : 1;

    const next = new Date(y, m + delta, 1);
    state.viewMonth = next;

    // 선택 날짜를 같은 "일"로 유지(가능한 범위에서)
    if (state.selectedDate) {
      const nd = clampDay(next.getFullYear(), next.getMonth(), day);
      state.selectedDate = new Date(next.getFullYear(), next.getMonth(), nd);
    }

    refresh();
  }

  async function refresh() {
    await fetchEventsForCurrentMonth();
    render();
    // 선택이 없으면 오늘 자동 선택(현재 달에 포함될 때만)
    if (!state.selectedDate) {
      const now = new Date();
      if (now.getFullYear() === state.viewMonth.getFullYear() && now.getMonth() === state.viewMonth.getMonth()) {
        state.selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        render();
        renderDayPanel(state.selectedDate);
      }
    }
  }

  function wire() {
    els.prevBtn.addEventListener("click", () => goMonth(-1));
    els.nextBtn.addEventListener("click", () => goMonth(1));
    els.todayBtn.addEventListener("click", () => {
      const now = new Date();
      state.viewMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      state.selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      refresh();
    });
    els.refreshBtn.addEventListener("click", refresh);
  }

  wire();
  refresh();
})();
