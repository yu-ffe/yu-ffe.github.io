function buildCalendar() {
  const container = document.getElementById("calendar");
  container.innerHTML = `<h2>${new Date().getFullYear()}년 ${new Date().getMonth()+1}월 캘린더</h2>`;

  const daysDiv = document.createElement("div");
  daysDiv.className = "days";

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDate = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
  const startDow = firstDay.getDay();

  // 요일 공백
  for (let i = 0; i < startDow; i++) {
    const blank = document.createElement("div");
    blank.className = "day";
    daysDiv.appendChild(blank);
  }

  // 날짜 채우기
  for (let d = 1; d <= lastDate; d++) {
    const dayEl = document.createElement("div");
    dayEl.className = "day";
    dayEl.textContent = d;

    const isToday = (d === now.getDate());
    if (isToday) dayEl.classList.add("today");

    daysDiv.appendChild(dayEl);
  }

  container.appendChild(daysDiv);
}
buildCalendar();
