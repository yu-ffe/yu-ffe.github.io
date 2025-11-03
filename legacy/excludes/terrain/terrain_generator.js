let tiles = []; // 2차원 배열 형태의 타일 저장

export function addTile(row, col, tileSize, centerX, centerY, _aetherisArea) {
  if (!tiles[row]) tiles[row] = [];

  let tile = document.createElement("div");
  tile.classList.add("tile");

  let backgroundImg = document.createElement("img");
  backgroundImg.src = "image/background/tile_color1.png";

  let frameImg = document.createElement("img");
  let randomValue = Math.floor(Math.random() * 5 + 1); // 1~5 랜덤 값
  frameImg.src = `image/frames/frame${randomValue}.png`;

  // 아이소메트릭 좌표 변환
  let posX = ((col - row) * tileSize) / 2;
  let posY = ((col + row) * tileSize) / 4;

  let left = centerX - tileSize + posX;
  let top = centerY + posY - tileSize;

  tile.style.position = "absolute";
  tile.style.left = `${left}px`;
  tile.style.top = `${top}px`;
  tile.style.width = `${tileSize}px`;
  tile.style.height = `${tileSize}px`;
  tile.style.zIndex = 1;

  tile.appendChild(backgroundImg);
  tile.appendChild(frameImg);
  _aetherisArea.appendChild(tile);
  tiles[row][col] = tile; // 2차원 배열에 저장
}

export function Terrain_Generate(_aetherisArea) {
  tiles = []; // 기존 타일 데이터 초기화

  let gameAreaRect = _aetherisArea.getBoundingClientRect();
  let centerX = gameAreaRect.width / 2;
  let centerY = gameAreaRect.height / 2;
  let tileSize = Math.min(gameAreaRect.width, gameAreaRect.height) * 0.1;

  // 5x5 타일 생성 (아이소메트릭 형태)
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      addTile(row, col, tileSize, centerX, centerY, _aetherisArea);
    }
  }
}