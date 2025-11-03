// 캐릭터 이동 속도
let speed = 1;
let isMovingUp = false;
let isMovingDown = false;
let isMovingLeft = false;
let isMovingRight = false;

// 캐릭터 제어 함수
function handleCharacterControl() {
  // 키보드 이벤트 리스너 추가
  window.addEventListener("keydown", (e) => {
    // 각 방향에 대한 이동 상태 설정
    switch (e.key) {
      case "ArrowUp":
        isMovingUp = true;
        break;
      case "ArrowDown":
        isMovingDown = true;
        break;
      case "ArrowLeft":
        isMovingLeft = true;
        break;
      case "ArrowRight":
        isMovingRight = true;
        break;
      default:
        break;
    }
  });

  // 키보드 이벤트 리스너 제거 (키가 떼어졌을 때)
  window.addEventListener("keyup", (e) => {
    switch (e.key) {
      case "ArrowUp":
        isMovingUp = false;
        break;
      case "ArrowDown":
        isMovingDown = false;
        break;
      case "ArrowLeft":
        isMovingLeft = false;
        break;
      case "ArrowRight":
        isMovingRight = false;
        break;
      default:
        break;
    }
  });

  // 캐릭터 이동을 부드럽게 처리하는 함수
  function moveCharacter() {
    // 캐릭터의 현재 위치
    let currentLeft = parseFloat(character.style.left);
    let currentTop = parseFloat(character.style.top);

    // 이동 방향에 따라 캐릭터 이동
    if (isMovingUp) {
      character.style.top = `${currentTop - speed}px`;
      updateCharacterDirection("top");
    }
    if (isMovingDown) {
      character.style.top = `${currentTop + speed}px`;
      updateCharacterDirection("down");
    }
    if (isMovingLeft) {
      character.style.left = `${currentLeft - speed}px`;
      updateCharacterDirection("left");
    }
    if (isMovingRight) {
      character.style.left = `${currentLeft + speed}px`;
      updateCharacterDirection("right");
    }

    // 부드러운 이동을 위해 재귀 호출 (프레임마다 호출)
    requestAnimationFrame(moveCharacter);
  }

  function updateCharacterDirection(direction) {
    // 변경된 방향에 맞게 이미지를 업데이트
    let dir;
    if (direction == "right") {
      dir = 0; // 오른쪽
    } else if (direction == "top") {
      dir = 90; // 위쪽
    } else if (direction == "left") {
      dir = 180; // 왼쪽
    } else if (direction == "down") {
      dir = -90; // 아래쪽
    }

    changeImage(dir);
  }

  // 이동 함수 실행
  moveCharacter();
}

handleCharacterControl();
