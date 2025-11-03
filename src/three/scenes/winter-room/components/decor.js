// Stream_LiveGame :: 장식 요소 생성을 위해 Three.js를 사용한다.
import * as THREE from "three";
import { ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

export function addDecor(parent) {
  // Stream_LiveGame :: 벽 장식과 책장을 각각 구성한다.
  const frames = createGalleryWall();
  const { group: bookshelf, books } = createBookshelf();

  frames.forEach((frame) => parent.add(frame));
  parent.add(bookshelf);

  return {
    bookshelfBooks: books,
  };
}

function createGalleryWall() {
  const { width, height, floorLevel, depth } = ROOM_SIZE;
  const mountZ = -depth / 2 + WALL_THICKNESS / 2 + 0.04;

  const frames = [];

  // Stream_LiveGame :: 세로형 액자를 생성하여 벽에 배치한다.
  const tallFrame = createRectangularFrame({
    width: 3.2,
    height: 4.4,
    border: 0.32,
    depth: 0.22,
    frameColor: 0xdcb48e,
    canvasColor: 0xa8d8ff,
  });
  tallFrame.position.set(-1.6, floorLevel + height - 6.2, mountZ);
  tallFrame.rotation.z = THREE.MathUtils.degToRad(2.4);
  frames.push(tallFrame);

  // Stream_LiveGame :: 가로형 액자로 균형을 맞춘다.
  const wideFrame = createRectangularFrame({
    width: 4.8,
    height: 2.4,
    border: 0.28,
    depth: 0.16,
    frameColor: 0xc99971,
    canvasColor: 0xffe5cc,
  });
  wideFrame.position.set(2.4, floorLevel + height - 5.3, mountZ + 0.02);
  wideFrame.rotation.z = THREE.MathUtils.degToRad(-4.2);
  frames.push(wideFrame);

  // Stream_LiveGame :: 원형 액자를 추가하여 시각적 변화를 준다.
  const roundFrame = createCircularFrame({
    radius: 1.45,
    border: 0.28,
    depth: 0.18,
    frameColor: 0xf0d2b4,
    canvasColor: 0xf4f9ff,
  });
  roundFrame.position.set(5.3, floorLevel + height - 6.4, mountZ + 0.04);
  roundFrame.rotation.z = THREE.MathUtils.degToRad(3.2);
  frames.push(roundFrame);

  return frames;
}
function createBookshelf() {
  const { width, depth, height, floorLevel } = ROOM_SIZE;

  const shelfGroup = new THREE.Group();

  // 벽면 꽉 채우기: 좌우는 살짝 여유만, 상단만 소량 여유
  const sideMargin = 0.4;
  const topMargin = 0.6;
  const backGap = 0.02;

  const panelThickness = 0.22;

  const shelfWidth  = Math.max( width - sideMargin * 2, 6.0 );
  const shelfHeight = Math.max( height - topMargin, 4.0 );
  const shelfDepth  = Math.min( 1.4, depth - WALL_THICKNESS - 0.12 );

  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: 0xcaa77a,
    roughness: 0.55,
    metalness: 0.1,
    emissive: new THREE.Color(0x4a2e1c).multiplyScalar(0.06),
  });

  // 기둥/상하판
  const sideGeometry      = new THREE.BoxGeometry(panelThickness, shelfHeight, shelfDepth);
  const topBottomGeometry = new THREE.BoxGeometry(shelfWidth, panelThickness, shelfDepth);

  const leftSide = new THREE.Mesh(sideGeometry, shelfMaterial);
  leftSide.position.x = -shelfWidth / 2 + panelThickness / 2;
  const rightSide = leftSide.clone();
  rightSide.position.x =  shelfWidth / 2 - panelThickness / 2;

  const topPanel = new THREE.Mesh(topBottomGeometry, shelfMaterial);
  topPanel.position.y =  shelfHeight / 2 - panelThickness / 2;
  const bottomPanel = topPanel.clone();
  bottomPanel.position.y = -shelfHeight / 2 + panelThickness / 2;

  shelfGroup.add(leftSide, rightSide, topPanel, bottomPanel);

  // 선반층: 벽 높이에 맞춰 5단
  const shelfLevels = 5;
  for (let i = 1; i <= shelfLevels; i += 1) {
    const shelf = new THREE.Mesh(topBottomGeometry, shelfMaterial);
    shelf.scale.y = 0.5;
    shelf.position.y = -shelfHeight / 2 + (shelfHeight / (shelfLevels + 1)) * i;
    shelfGroup.add(shelf);
  }

  // 책 채우기(좌하단 → 우하단으로 밀도 감소)
  const books = addBooksToShelfGradient(
    shelfGroup,
    shelfWidth,
    shelfHeight,
    shelfDepth,
    panelThickness,
    shelfLevels
  );

  // 바닥 위에 "놓이게": 하단이 floorLevel에 닿도록
  shelfGroup.position.set(
    0,                                  // 벽 중앙 정렬
    floorLevel + shelfHeight / 2,       // 바닥 접지
    -depth / 2 + WALL_THICKNESS + shelfDepth / 2 + backGap // 뒷벽에 밀착
  );

  return { group: shelfGroup, books };
}

// 좌하단에서 우하단으로 갈수록 책 밀도를 줄이는 배치
function addBooksToShelfGradient(group, shelfWidth, shelfHeight, shelfDepth, panelThickness, shelfLevels) {
  const usableWidth = shelfWidth - panelThickness * 2 - 0.8; // 좌우 여백
  const startX = -shelfWidth / 2 + panelThickness + 0.4;
  const endX   =  shelfWidth / 2 - panelThickness - 0.4;

  const bookDepth = shelfDepth - panelThickness * 2;
  const colors = [0xffebe0, 0xffcfd2, 0xf9b4ab, 0xbce6ff, 0xacc3ff, 0xd6e4f5, 0xf2e6b8];

  const startY = -shelfHeight / 2 + panelThickness * 2;
  const shelfSpacing = (shelfHeight - panelThickness * 2) / (shelfLevels + 1);
  const bookMeshes = [];

  for (let row = 0; row < shelfLevels; row += 1) {
    const rowY = startY + shelfSpacing * (row + 1);
    const rowNorm = row / Math.max(1, shelfLevels - 1); // 0=아래, 1=위

    let x = startX;
    let i = 0;
    while (x < endX) {
      const seed = row * 101 + i * 37;

      // 기본 두께/틈
      const thickness = 0.22 + seededNoise(seed + 5) * 0.22;
      const gap = THREE.MathUtils.lerp(0.08, 0.16, seededNoise(seed + 9));

      // x 진행 비율(왼쪽 0 → 오른쪽 1)
      const t = (x - startX) / usableWidth;

      // 밀도 함수: 왼쪽·아래에선 빽빽, 오른쪽·위로 갈수록 성글게
      const density =
        1.0
        - 0.65 * t           // 오른쪽으로 갈수록 감소
        - 0.20 * rowNorm     // 위로 갈수록 약간 감소
        + 0.08 * (seededNoise(seed + 11) - 0.5); // 살짝 랜덤

      if (density > 0.35) {
        // 책 하나 배치
        const height = THREE.MathUtils.lerp(0.9, Math.max(1.7, shelfHeight * 0.22), seededNoise(seed));
        const bookGeometry = new THREE.BoxGeometry(thickness, height, bookDepth);
        const bookMaterial = new THREE.MeshStandardMaterial({
          color: colors[(row * 17 + i) % colors.length],
          roughness: 0.42,
          metalness: 0.05,
          emissive: new THREE.Color(0xffe2c5).multiplyScalar(0.05),
        });

        const book = new THREE.Mesh(bookGeometry, bookMaterial);
        book.position.set(x + thickness / 2, rowY + height / 2, 0);
        book.rotation.z = (seededNoise(seed + 13) - 0.5) * 0.12; // 살짝 기울기
        book.castShadow = true;
        book.receiveShadow = true;

        book.userData.isInteractiveBook = false;
        book.userData.link = null;
        book.userData.highlight = {
          originalPosition: book.position.clone(),
          originalColor: book.material.color.clone(),
          originalEmissive: book.material.emissive.clone(),
        };

        group.add(book);
        bookMeshes.push(book);

        x += thickness + gap;
      } else {
        // 공백만 두고 넘어가 밀도 낮춤
        x += THREE.MathUtils.lerp(0.18, 0.32, seededNoise(seed + 21));
      }
      i += 1;
    }
  }

  return bookMeshes;
}

function seededNoise(seed) {
  return (Math.sin(seed * 127.1) + 1) / 2;
}


function createRectangularFrame({
  width,
  height,
  border,
  depth,
  frameColor,
  canvasColor,
}) {
  const outerShape = new THREE.Shape();
  outerShape.moveTo(-width / 2 - border, -height / 2 - border);
  outerShape.lineTo(width / 2 + border, -height / 2 - border);
  outerShape.lineTo(width / 2 + border, height / 2 + border);
  outerShape.lineTo(-width / 2 - border, height / 2 + border);
  outerShape.lineTo(-width / 2 - border, -height / 2 - border);

  const innerHole = new THREE.Path();
  innerHole.moveTo(-width / 2, -height / 2);
  innerHole.lineTo(width / 2, -height / 2);
  innerHole.lineTo(width / 2, height / 2);
  innerHole.lineTo(-width / 2, height / 2);
  innerHole.lineTo(-width / 2, -height / 2);
  outerShape.holes.push(innerHole);

  const frameGeometry = new THREE.ExtrudeGeometry(outerShape, {
    depth,
    bevelEnabled: false,
  });
  frameGeometry.center();

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: frameColor,
    roughness: 0.6,
    metalness: 0.15,
  });

  const canvasMaterial = new THREE.MeshStandardMaterial({
    color: canvasColor,
    roughness: 0.9,
    metalness: 0.02,
  });

  const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);

  const canvasGeometry = new THREE.PlaneGeometry(width, height);
  const canvasMesh = new THREE.Mesh(canvasGeometry, canvasMaterial);
  canvasMesh.position.z = depth / 2 + 0.01;

  const group = new THREE.Group();
  group.add(frameMesh);
  group.add(canvasMesh);
  group.castShadow = true;
  group.receiveShadow = true;

  return group;
}

function createCircularFrame({ radius, border, depth, frameColor, canvasColor }) {
  const outerShape = new THREE.Shape();
  outerShape.absarc(0, 0, radius + border, 0, Math.PI * 2, false);

  const innerHole = new THREE.Path();
  innerHole.absarc(0, 0, radius, 0, Math.PI * 2, true);
  outerShape.holes.push(innerHole);

  const frameGeometry = new THREE.ExtrudeGeometry(outerShape, {
    depth,
    bevelEnabled: false,
  });
  frameGeometry.center();

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: frameColor,
    roughness: 0.55,
    metalness: 0.18,
  });

  const canvasMaterial = new THREE.MeshStandardMaterial({
    color: canvasColor,
    roughness: 0.85,
    metalness: 0.04,
  });

  const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);

  const canvasGeometry = new THREE.CircleGeometry(radius, 64);
  const canvasMesh = new THREE.Mesh(canvasGeometry, canvasMaterial);
  canvasMesh.position.z = depth / 2 + 0.01;

  const group = new THREE.Group();
  group.add(frameMesh);
  group.add(canvasMesh);
  group.castShadow = true;
  group.receiveShadow = true;

  return group;
}
