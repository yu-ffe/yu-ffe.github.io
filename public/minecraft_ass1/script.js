// script.js - Refactored + FAB Behavior (좌/우는 CSS에 위임)
document.addEventListener("DOMContentLoaded", () => {
    initIntersectionAnimations();
    initNavigationButtons();
    initFloatingActionButton();
});

/* ------------------------------------------------------------
   1) 스크롤 인 애니메이션 처리
------------------------------------------------------------ */
function initIntersectionAnimations() {
    const items = document.querySelectorAll(".gallery-item");
    if (!items.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2 }
    );

    items.forEach((item) => observer.observe(item));
}

/* ------------------------------------------------------------
   2) 페이지 이동 버튼 처리
------------------------------------------------------------ */
function initNavigationButtons() {
    const navButtons = document.querySelectorAll(".nav-button");
    if (!navButtons.length) return;

    navButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-target");
            if (target) window.location.href = target;
        });
    });
}

/* ------------------------------------------------------------
   3) FAB 초기화
   - 좌/우 위치는 CSS 클래스(.fab-left / .fab-right)에 맡깁니다.
   - JS에서는 top(25vh), transform, transition만 설정합니다.
------------------------------------------------------------ */
function initFloatingActionButton() {
    const fab = document.getElementById("download-fab");
    const tooltip = document.getElementById("fab-tooltip");
    if (!fab) return;

    /* ===== 고정 위치 설정 (수직 위치만 JS에서 제어) ===== */
    fab.style.position = "fixed";
    fab.style.top = "5vh";                     // 수직 위치: 25% 뷰포트 높이
    fab.style.transform = "translateY(-50%)";   // 중앙 정렬
    fab.style.transition = "opacity 180ms ease, transform 180ms ease";

    // 좌/우 위치는 CSS 클래스(.fab-left / .fab-right)가 담당해야 함.
    // 따라서 아래처럼 JS로 left/right를 직접 설정하지 않습니다.
    // (만약 HTML에 .fab-right / .fab-left 중 하나를 붙이면 CSS가 적용됩니다.)

    /* ===== 다운로드 & 툴팁 ===== */
    attachFabDownloadHandler(fab);
    attachFabTooltipHandler(fab, tooltip);

    /* ===== 스크롤 행동 ===== */
    initFabScrollBehavior(fab);
}

/* ------------------------------------------------------------
   FAB 다운로드 처리
------------------------------------------------------------ */
function attachFabDownloadHandler(fab) {
    fab.addEventListener("click", () => {
        const href = fab.getAttribute("data-href") || "assets/downloads/Assign_Plugin.jar";
        const a = document.createElement("a");
        a.href = href;
        a.setAttribute("download", "");
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();
    });

    fab.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fab.click();
        }
    });
}

/* ------------------------------------------------------------
   FAB 툴팁 처리
   (툴팁의 좌/우 위치도 CSS로 제어하세요)
------------------------------------------------------------ */
function attachFabTooltipHandler(fab, tooltip) {
    if (!tooltip) return;

    const show = () => tooltip.classList.add("show");
    const hide = () => tooltip.classList.remove("show");

    fab.addEventListener("mouseenter", show);
    fab.addEventListener("mouseleave", hide);
    fab.addEventListener("focus", show);
    fab.addEventListener("blur", hide);
}

/* ------------------------------------------------------------
   FAB 스크롤 조건 제어 (정확한 동작 구현)
------------------------------------------------------------ */
function initFabScrollBehavior(fab) {
    let lastScroll = window.scrollY;

    const TOP_SHOW_RANGE = 80;      // 화면 위 0~80px → 나타남
    const BOTTOM_SHOW_RANGE = 80;   // 화면 끝에서 80px 전후 → 나타남

    const showFab = () => {
        fab.style.opacity = "1";
        fab.style.transform = "translateY(-50%)";
    };

    const hideFab = () => {
        fab.style.opacity = "0";
        fab.style.transform = "translateY(-120%)";
    };

    window.addEventListener("scroll", () => {
        const scroll = window.scrollY;
        const viewport = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const maxScroll = docHeight - viewport;

        const scrollingDown = scroll > lastScroll;

        /* 1) 화면 맨 위 — TOP_SHOW_RANGE 내부면 무조건 표시 */
        if (scroll <= TOP_SHOW_RANGE) {
            showFab();
            lastScroll = scroll;
            return;
        }

        /* 2) 화면 맨 아래 — BOTTOM_SHOW_RANGE 내부면 무조건 표시 */
        if (scroll >= maxScroll - BOTTOM_SHOW_RANGE) {
            showFab();
            lastScroll = scroll;
            return;
        }

        /* 3) 일반 구간 — 방향에 따라 즉시 사라짐 */
        if (scrollingDown) {
            hideFab();
        } else {
            hideFab(); // 올릴 때도 극근처가 아니면 나타나지 않음
        }

        lastScroll = scroll;
    }, { passive: true });
}
