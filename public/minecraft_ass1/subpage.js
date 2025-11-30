document.addEventListener("DOMContentLoaded", () => {
  setupMusicToggle();
  setupDownloadButton();
  setupRevealOnScroll();
  setupHeaderScrollBehavior();
  setupFloatingPanelNav();
  setupSectionSpy();
  setupTopButton();
  setupCodeCopyButtons();
  setupCodeCollapsible(); // ⬅️ 접기/펼치기 초기화
});

/* ---------------------------
   BGM 토글
--------------------------- */
function setupMusicToggle() {
  const btn = document.getElementById("music-toggle");
  const audio = document.getElementById("bgm-audio");
  if (!btn || !audio) return;

  const iconSpan = btn.querySelector(".float-panel__music-icon");

  const updateState = (isPlaying) => {
    btn.setAttribute("aria-pressed", String(isPlaying));
    if (iconSpan) {
      iconSpan.textContent = isPlaying ? "⏸" : "▶";
    }
  };

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio
        .play()
        .then(() => updateState(true))
        .catch(() => {
          // 자동재생 제한 등은 조용히 무시
        });
    } else {
      audio.pause();
      updateState(false);
    }
  });
}

/* ---------------------------
   다운로드 버튼
--------------------------- */
function setupDownloadButton() {
  const button = document.getElementById("download-button");
  if (!button) return;

  button.addEventListener("click", () => {
    const fileUrl = button.getAttribute("data-file");
    if (!fileUrl) return;

    const a = document.createElement("a");
    a.href = fileUrl;
    a.setAttribute("download", "");
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
}

/* ---------------------------
   섹션 등장 애니메이션
--------------------------- */
function setupRevealOnScroll() {
  const blocks = document.querySelectorAll(".block.reveal");
  if (!blocks.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  blocks.forEach((el) => observer.observe(el));
}

/* ---------------------------
   헤더 스크롤 동작
   - 아래로 스크롤: 숨김
   - 위로 스크롤:
     - 맨 위 근처: 확장
     - 중간 이후: 컴팩트
--------------------------- */
function setupHeaderScrollBehavior() {
  const header = document.getElementById("page-header");
  if (!header) return;

  let lastScroll = window.scrollY || 0;
  const topExpandedThreshold = 30;
  const showHeaderScrollDelta = 4;

  const applyState = (state) => {
    header.classList.remove(
      "shell-header--hidden",
      "shell-header--compact",
      "shell-header--expanded"
    );
    header.classList.add(state);
  };

  // 초기 상태
  applyState("shell-header--expanded");

  window.addEventListener(
    "scroll",
    () => {
      const current = window.scrollY || 0;
      const delta = current - lastScroll;

      if (Math.abs(delta) < showHeaderScrollDelta) {
        return;
      }

      const scrollingDown = delta > 0;

      if (scrollingDown) {
        if (current > topExpandedThreshold) {
          applyState("shell-header--hidden");
        }
      } else {
        if (current <= topExpandedThreshold) {
          applyState("shell-header--expanded");
        } else {
          applyState("shell-header--compact");
        }
      }

      lastScroll = current;
    },
    { passive: true }
  );
}

/* ---------------------------
   플로팅 패널: 섹션 버튼 클릭
--------------------------- */
function setupFloatingPanelNav() {
  const links = document.querySelectorAll(".float-link");
  if (!links.length) return;

  links.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetSelector = btn.getAttribute("data-target");
      if (!targetSelector) return;

      const target = document.querySelector(targetSelector);
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ---------------------------
   플로팅 패널: 현재 섹션 감지
   - Now viewing 텍스트 업데이트
   - 해당 번호 버튼 active 처리
--------------------------- */
function setupSectionSpy() {
  const sections = document.querySelectorAll(".block[id]");
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const labelEl = document.getElementById("float-current-label");
  const links = document.querySelectorAll(".float-link");
  const linkMap = new Map(); // id -> button

  links.forEach((btn) => {
    const targetSelector = btn.getAttribute("data-target");
    if (!targetSelector) return;
    const id = targetSelector.replace("#", "");
    linkMap.set(id, btn);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const sec = entry.target;
        const id = sec.id;
        const titleEl = sec.querySelector(".block__title");
        const titleText = titleEl ? titleEl.textContent.trim() : id;

        // Now viewing 텍스트 변경
        if (labelEl && titleText) {
          labelEl.textContent = titleText;
        }

        // 버튼 active 상태 변경
        links.forEach((btn) => btn.classList.remove("float-link--active"));
        const linkedBtn = linkMap.get(id);
        if (linkedBtn) {
          linkedBtn.classList.add("float-link--active");
        }
      });
    },
    {
      threshold: 0.4,
    }
  );

  sections.forEach((sec) => observer.observe(sec));
}

/* ---------------------------
   맨 위로 버튼
--------------------------- */
function setupTopButton() {
  const btn = document.getElementById("float-top");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------------------------
   코드 박스: 복사 버튼
--------------------------- */
function setupCodeCopyButtons() {
  const buttons = document.querySelectorAll(".code-block [data-copy-target]");
  if (!buttons.length || !navigator.clipboard) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetSelector = btn.getAttribute("data-copy-target");
      if (!targetSelector) return;

      const codeEl = document.querySelector(targetSelector);
      if (!codeEl) return;

      const text = codeEl.innerText.replace(/\n{3,}$/g, "\n"); // 맨 끝 공백 줄 정리

      navigator.clipboard
        .writeText(text)
        .then(() => {
          const original = btn.textContent;
          btn.textContent = "복사됨!";
          setTimeout(() => {
            btn.textContent = original;
          }, 1500);
        })
        .catch(() => {
          // 실패해도 조용히 무시
        });
    });
  });
}

/* ---------------------------
   코드 박스: 길이 제한 + 접기/펼치기
--------------------------- */
function setupCodeCollapsible() {
  const MAX_COLLAPSED_HEIGHT = 220; // px 기준. 필요하면 숫자만 바꾸세요.

  const blocks = document.querySelectorAll(".code-block[data-code-block]");
  if (!blocks.length) return;

  blocks.forEach((block) => {
    const body = block.querySelector(".code-block__body");
    const toggleBtn = block.querySelector("[data-code-toggle]");

    if (!body || !toggleBtn) {
      return;
    }

    // 일단 제한 없이 전체 높이 계산
    // (스타일이 바뀌었을 수 있으니 maxHeight/overflow 임시 해제)
    const previousMaxHeight = body.style.maxHeight;
    const previousOverflowY = body.style.overflowY;

    body.style.maxHeight = "none";
    body.style.overflowY = "auto";

    const fullHeight = body.scrollHeight;

    // 원래 상태 복구
    body.style.maxHeight = previousMaxHeight;
    body.style.overflowY = previousOverflowY;

    // 일정 높이 이하라면 접기 기능 필요 없음
    if (fullHeight <= MAX_COLLAPSED_HEIGHT + 10) {
      // footer는 그대로지만 버튼은 숨기고 싶으면 여기서 display none 처리해도 됨
      block.classList.remove(
        "code-block--collapsible",
        "code-block--collapsed",
        "code-block--expanded"
      );
      toggleBtn.style.display = "none";
      return;
    }

    // 접기 기능 활성화
    block.classList.add("code-block--collapsible", "code-block--collapsed");
    block.style.setProperty(
      "--code-collapsed-height",
      MAX_COLLAPSED_HEIGHT + "px"
    );

    // 기본 텍스트: 접힌 상태 = "더 보기"
    toggleBtn.textContent = "더 보기";
    // 접힌 상태에서 스크롤 위치에 따라 페이드 표시/숨김
    const updateFadeVisibility = () => {
      // 접힌 상태가 아니면 페이드는 항상 숨김
      if (!block.classList.contains("code-block--collapsed")) {
        block.classList.add("code-block--no-fade");
        return;
      }

      const scrollTop = body.scrollTop;
      const visible = body.clientHeight;
      const total = body.scrollHeight;

      // 거의 맨 아래까지 내려왔으면 페이드 제거
      const nearBottom = scrollTop + visible >= total - 4;

      if (nearBottom) {
        block.classList.add("code-block--no-fade");
      } else {
        block.classList.remove("code-block--no-fade");
      }
    };

    // 스크롤할 때마다 페이드 상태 갱신
    body.addEventListener("scroll", updateFadeVisibility, { passive: true });

    // 초기 상태에서도 한 번 계산
    updateFadeVisibility();

    toggleBtn.addEventListener("click", () => {
      const isCollapsed = block.classList.contains("code-block--collapsed");

      if (isCollapsed) {
        // 펼치기
        block.classList.remove("code-block--collapsed");
        block.classList.add("code-block--expanded");
        body.style.maxHeight = fullHeight + "px"; // 전체 높이까지 애니메이션
        body.style.overflowY = "auto"; // 펼쳐져도 스크롤은 그대로
        toggleBtn.textContent = "접기";
      } else {
        // 다시 접기
        block.classList.remove("code-block--expanded");
        block.classList.add("code-block--collapsed");
        body.style.maxHeight = MAX_COLLAPSED_HEIGHT + "px"; // 접힌 높이까지만 보이게
        body.style.overflowY = "auto"; // ⬅ hidden 대신 auto 유지
        toggleBtn.textContent = "더 보기";
      }
    });
  });
}
