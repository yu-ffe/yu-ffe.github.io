import { setRotation } from "../utils/transform.js";

let cubes = []; // 2차원 배열 형태의 큐브 저장

export function addCube(row, col, cubeSize, centerX, centerY, _aetherisArea) {
  if (!cubes[row]) cubes[row] = [];

  let cube = document.createElement("div");
  cube.classList.add("cube");

  // 아이소메트릭 좌표 변환
  let posX = ((col - row) * cubeSize) / 2;
  let posY = ((col + row) * cubeSize) / 4;

  let left = centerX - cubeSize + posX;
  let top = centerY + posY - cubeSize * 2; // 높이 반영

  cube.style.position = "absolute";
  cube.style.left = `${left}px`;
  cube.style.top = `${top}px`;
  cube.style.width = `${cubeSize}px`;
  cube.style.height = `${cubeSize}px`;
  cube.style.transformStyle = "preserve-3d";

  // 큐브의 6개 면 생성
  let faces = ["front", "back", "left", "right", "top", "bottom"];
  faces.forEach((face) => {
    let faceDiv = document.createElement("div");
    faceDiv.classList.add("face", face);
    faceDiv.style.width = `${cubeSize}px`;
    faceDiv.style.height = `${cubeSize}px`;
    faceDiv.style.background = "rgba(255, 255, 255, 0.3)";
    cube.appendChild(faceDiv);
  });

  setRotation(cube, 20, 20, 20); // 회전 설정

  _aetherisArea.appendChild(cube);
  cubes[row][col] = cube; // 2차원 배열에 저장
}

export function Cube_Generate(_aetherisArea) {
  cubes = []; // 기존 큐브 데이터 초기화

  let gameAreaRect = _aetherisArea.getBoundingClientRect();
  let centerX = gameAreaRect.width / 2;
  let centerY = gameAreaRect.height / 2;
  let cubeSize = Math.min(gameAreaRect.width, gameAreaRect.height) * 0.1;

  // 5x5 큐브 생성
  //   for (let row = 0; row < 5; row++) {
  //     for (let col = 0; col < 5; col++) {
  addCube(2, 2, cubeSize, centerX, centerY, _aetherisArea);
  //     }
  //   }
}
