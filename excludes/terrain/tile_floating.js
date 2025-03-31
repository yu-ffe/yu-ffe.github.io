// //TODO: 규격에 맞게 위아래 진폭 설정(맵이 작으면 진폭도 작게)

// setTimeout(() => {
//   tiles.forEach((row) => {
//     row.forEach((tile) => {
//       let floatSpeed = 0.0001 + Math.random() * 0.0005; // 랜덤한 속도 (0.005 ~ 0.01)
//       let floatAmplitude = 5 + Math.random() * 1; // 랜덤한 진폭 (5 ~ 10px)
//       let offset = Math.random() * Math.PI * 1; // 개별적인 시작 지점 (위상 차이)

//       function floatAnimation() {
//         let time = Date.now() * floatSpeed; // 현재 시간을 기반으로 움직임 계산
//         let floatY = Math.sin(time + offset) * floatAmplitude; // 사인파로 위아래 이동

//         tile.style.transform = `translateY(${floatY}px)`; // 타일 이동 적용

//         requestAnimationFrame(floatAnimation); // 애니메이션 지속
//       }

//       floatAnimation(); // 애니메이션 시작
//     });
//   });
// }, 500);