// 이미지 파일 경로
const directions = {
    right: [
      "image/character/right.png",
      "image/character/right.png",
      "image/character/right.png",
      "image/character/right.png",
    ],
    top_right: [
      "image/character/top_right.png",
      "image/character/top_right.png",
      "image/character/top_right.png",
      "image/character/top_right.png",
    ],
    top: [
      "image/character/top.png",
      "image/character/top.png",
      "image/character/top.png",
      "image/character/top.png",
    ],
    top_left: [
      "image/character/top_left.png",
      "image/character/top_left.png",
      "image/character/top_left.png",
      "image/character/top_left.png",
    ],
    left: [
      "image/character/left.png",
      "image/character/left.png",
      "image/character/left.png",
      "image/character/left.png",
    ],
    down_left: [
      "image/character/down_left.png",
      "image/character/down_left.png",
      "image/character/down_left.png",
      "image/character/down_left.png",
    ],
    down: [
      "image/character/down.png",
      "image/character/down.png",
      "image/character/down.png",
      "image/character/down.png",
    ],
    down_right: [
      "image/character/down_right.png",
      "image/character/down_right.png",
      "image/character/down_right.png",
      "image/character/down_right.png",
    ],
  };
  
  // 현재 이미지 상태
  let targetDirection = 0;
  let currentDirection = 0;
  
  // 이전 방향을 저장
  let previousDirection = null;
  
  // 마우스 위치에 따라 방향을 계산하는 함수
  function calculateDirection(mouseX, mouseY) {
    const characterRect = character.getBoundingClientRect();
    const characterX = characterRect.left + characterRect.width / 2;
    const characterY = characterRect.top + characterRect.height / 2;
  
    const deltaX = mouseX - characterX;
    const deltaY = mouseY - characterY;
  
    // 각도 계산
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI); // 라디안을 각도로 변환
  
    // 8방향 구역을 설정
    let direction = 0;
  
    if (angle >= -22.5 && angle < 22.5) {
      direction = 0; // 오른쪽
    } else if (angle >= 22.5 && angle < 67.5) {
      direction = -45; // 오른쪽 하단
    } else if (angle >= 67.5 && angle < 112.5) {
      direction = -90; // 아래쪽
    } else if (angle >= 112.5 && angle < 157.5) {
      direction = -135; // 아래쪽 상단
    } else if (angle >= 157.5 || angle < -157.5) {
      direction = 180; // 왼쪽
    } else if (angle >= -157.5 && angle < -112.5) {
      direction = 135; // 왼쪽 상단
    } else if (angle >= -112.5 && angle < -67.5) {
      direction = 90; // 위쪽
    } else if (angle >= -67.5 && angle < -22.5) {
      direction = 45; // 오른쪽 상단
    }
  
    return direction;
  }
  
  // 이미지 변경 함수
  function changeImage(direction) {
    const directionKey = getDirectionKey(direction);
  
    // character div 안에 있는 img 요소를 가져오기
    const characterImage = character.querySelector("img");
  
    // 이미지 변경
    characterImage.src = directions[directionKey][0]; // 첫 번째 이미지만 사용
  }
  
  // 방향을 8방향으로 매핑하는 함수
  function getDirectionKey(direction) {
    if (direction >= -22.5 && direction < 22.5) {
      return "right";
    } else if (direction >= 22.5 && direction < 67.5) {
      return "top_right";
    } else if (direction >= 67.5 && direction < 112.5) {
      return "top";
    } else if (direction >= 112.5 && direction < 157.5) {
      return "top_left";
    } else if (direction >= 157.5 || direction < -157.5) {
      return "left";
    } else if (direction >= -157.5 && direction < -112.5) {
      return "down_left";
    } else if (direction >= -112.5 && direction < -67.5) {
      return "down";
    } else if (direction >= -67.5 && direction < -22.5) {
      return "down_right";
    }
  }
  
  // 화면의 마우스 위치를 추적하여 캐릭터 이미지 변경 (8방향으로 나누기)
  document.addEventListener("mousemove", (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
  
    // 마우스 위치에 따른 방향 계산
    const newDirection = calculateDirection(mouseX, mouseY);
  
    // 회전할 방향을 저장
    targetDirection = newDirection;
  
    // 이미지 변경 함수 호출
    changeImage(targetDirection);
  });
  