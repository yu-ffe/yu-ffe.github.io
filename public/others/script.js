document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".gallery-item");

    // IntersectionObserver로 스크롤 인 애니메이션 처리
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    // 한 번 보이면 계속 유지하고 싶으면 unobserve
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.2,
        }
    );

    items.forEach((item) => observer.observe(item));
});


document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.querySelectorAll(".nav-button");

    navButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-target");
            if (!target) return;

            // 필요하면 여기에서 전체 URL로도 변경 가능:
            // window.location.href = "http://127.0.0.1:5500/public/others/" + target;

            window.location.href = target;
        });
    });
});
