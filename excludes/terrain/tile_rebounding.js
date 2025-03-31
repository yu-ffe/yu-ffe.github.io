// 캐릭터가 밟았을때 일시적으로 크게 내려가는 로직

// let currentTile = null; // 캐릭터가 밟고 있는 타일
// let isOnTile = false; // 캐릭터가 타일 위에 있는지 확인

// // 타일 감지 및 밟고 있는 타일 처리
// function detectTile() {
//   let characterRect = character.getBoundingClientRect();
  
//   // 타일 중 캐릭터가 겹치는 타일 찾기
//   let tileUnderCharacter = null;
//   tiles.forEach((row) => {
//     row.forEach((tile) => {
//       let tileRect = tile.getBoundingClientRect();
//       if (
//         characterRect.left < tileRect.right &&
//         characterRect.right > tileRect.left &&
//         characterRect.top < tileRect.bottom &&
//         characterRect.bottom > tileRect.top
//       ) {
//         tileUnderCharacter = tile;
//       }
//     });
//   });

//   if (tileUnderCharacter && !isOnTile) {
//     // 타일을 밟았을 때 (처음 밟을 때)
//     let currentTransform = tileUnderCharacter.style.transform || "translateY(0px)";
//     let currentTranslateY = parseFloat(currentTransform.replace("translateY(", "").replace("px)", "")) || 0;
//     tileUnderCharacter.style.transform = `translateY(${currentTranslateY + 50}px)`; // 기존 값에 50px 더하기
//     isOnTile = true;
//     currentTile = tileUnderCharacter;
//     console.log(`Character stepped on tile: ${tileUnderCharacter}`); // 타일이 바뀔 때 로그 찍기
//   } else if (!tileUnderCharacter && isOnTile) {
//     // 타일을 떠났을 때 (타일 위에 있지 않으면)
//     let currentTransform = currentTile.style.transform || "translateY(0px)";
//     let currentTranslateY = parseFloat(currentTransform.replace("translateY(", "").replace("px)", "")) || 0;
//     currentTile.style.transform = `translateY(${currentTranslateY - 50}px)`; // 기존 값에서 50px 빼기
//     isOnTile = false;
//     console.log(`Character stepped off tile: ${currentTile}`); // 타일을 떠날 때 로그 찍기
//     currentTile = null;
//   }
// }

// // 60fps로 타일 감지
// function gameLoop() {
//   detectTile();
//   requestAnimationFrame(gameLoop); // 60fps로 반복 실행
// }

// gameLoop();
