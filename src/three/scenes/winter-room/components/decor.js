// decor.js
// Stream_LiveGame :: 장식 요소 생성을 위해 Three.js를 사용한다.
import * as THREE from "three";
import { ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

export function addDecor(parent, opts = {}) {
  // 옵션: { stairsConfig }
  const stairsConfig = opts.stairsConfig ?? null;

  // 1) 오른쪽 벽 갤러리(책장 뒤로 묻히지 않도록 뒤벽 대신 우측 벽에 설치)
  const rightWallFrames = createRightWallGallery();
  rightWallFrames.forEach((f) => parent.add(f));

  // 2) 뒤벽 책장
  const { group: bookshelf, books } = createBookshelf({ stairsConfig });
  parent.add(bookshelf);

  // 3) 테이블 + 의자(2) 세트 (계단이 있는 좌측을 피해서 방 중앙-우측)
  const { table, chairs } = createTableAndChairs();
  parent.add(table);
  chairs.forEach((c) => parent.add(c));

  return {
    bookshelfBooks: books,
    table,
    chairs,
  };
}

// ------------------------- 갤러리(오른쪽 벽) -------------------------
function createRightWallGallery() {
  const { width, height, floorLevel } = ROOM_SIZE;

  // 오른쪽 벽의 내부 면
  const mountX = width / 2 - WALL_THICKNESS / 2 - 0.04;

  const frames = [];

  // 세로형 액자
  const tall = createRectangularFrame({
    width: 2.8,
    height: 4.0,
    border: 0.28,
    depth: 0.2,
    frameColor: 0xdcb48e,
    canvasColor: 0xa8d8ff,
  });
  tall.position.set(mountX, floorLevel + height - 6.0, 0.8);
  tall.rotation.y = -Math.PI / 2; // 실내를 바라보도록
  tall.rotation.z = THREE.MathUtils.degToRad(1.6);
  frames.push(tall);

  // 가로형 액자
  const wide = createRectangularFrame({
    width: 4.2,
    height: 2.2,
    border: 0.26,
    depth: 0.16,
    frameColor: 0xc99971,
    canvasColor: 0xffe5cc,
  });
  wide.position.set(mountX + 0.02, floorLevel + height - 5.0, -1.6);
  wide.rotation.y = -Math.PI / 2;
  wide.rotation.z = THREE.MathUtils.degToRad(-3.2);
  frames.push(wide);

  // 원형 액자
  const round = createCircularFrame({
    radius: 1.35,
    border: 0.24,
    depth: 0.18,
    frameColor: 0xf0d2b4,
    canvasColor: 0xf4f9ff,
  });
  round.position.set(mountX + 0.03, floorLevel + height - 6.1, -3.6);
  round.rotation.y = -Math.PI / 2;
  round.rotation.z = THREE.MathUtils.degToRad(2.4);
  frames.push(round);

  return frames;
}

// ------------------------- 뒤벽 책장 -------------------------
function createBookshelf({ stairsConfig }) {
  const { width, depth, height, floorLevel } = ROOM_SIZE;

  const shelfGroup = new THREE.Group();

  // 여유치
  const sideMargin = 0.4;
  const topMargin = 0.6;
  const backGap = 0.02;
  const panelThickness = 0.22;

  // 뒤벽 깊이 안쪽 고정, 벽/계단과 간섭 방지
  const shelfDepth = Math.min(1.28, depth - WALL_THICKNESS - 0.16);

  // 전체 폭: 좌우 여유 유지
  const shelfWidth = Math.max(width - sideMargin * 2, 6.0);
  const shelfHeight = Math.max(height - topMargin, 4.2);

  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: 0xcaa77a,
    roughness: 0.55,
    metalness: 0.1,
    emissive: new THREE.Color(0x4a2e1c).multiplyScalar(0.06),
  });

  // 기둥/상하판
  const sideGeom = new THREE.BoxGeometry(panelThickness, shelfHeight, shelfDepth);
  const tbGeom = new THREE.BoxGeometry(shelfWidth, panelThickness, shelfDepth);

  const leftSide = new THREE.Mesh(sideGeom, shelfMaterial);
  leftSide.position.x = -shelfWidth / 2 + panelThickness / 2;

  const rightSide = leftSide.clone();
  rightSide.position.x = shelfWidth / 2 - panelThickness / 2;

  const topPanel = new THREE.Mesh(tbGeom, shelfMaterial);
  topPanel.position.y = shelfHeight / 2 - panelThickness / 2;

  const bottomPanel = topPanel.clone();
  bottomPanel.position.y = -shelfHeight / 2 + panelThickness / 2;

  shelfGroup.add(leftSide, rightSide, topPanel, bottomPanel);

  // 선반 5단
  const shelfLevels = 5;
  for (let i = 1; i <= shelfLevels; i += 1) {
    const shelf = new THREE.Mesh(tbGeom, shelfMaterial);
    shelf.scale.y = 0.5;
    shelf.position.y = -shelfHeight / 2 + (shelfHeight / (shelfLevels + 1)) * i;
    shelfGroup.add(shelf);
  }

  // 책 배치: 좌하단→우하단 밀도 감소
  const books = addBooksToShelfGradient(
    shelfGroup,
    shelfWidth,
    shelfHeight,
    shelfDepth,
    panelThickness,
    shelfLevels
  );

  // 위치: 뒤벽에 밀착, 바닥 접지
  shelfGroup.position.set(
    0,
    floorLevel + shelfHeight / 2,
    -depth / 2 + WALL_THICKNESS + shelfDepth / 2 + backGap
  );

  // 좌측 벽 계단과의 시각적 간섭 방지: 그룹 자체는 중앙이지만,
  // 계단이 방 좌측에 있으므로 테이블/의자는 우측으로 배치했고,
  // 책장은 깊이를 얕게 잡고 뒷벽 여백(backGap) 확보로 실제 겹침을 회피.
  // 필요시 여기서 shelfGroup.position.x를 약간(+0.2~0.4) 우측으로 밀어도 됨.

  // 상단 라인 살짝 그림자 강조
  shelfGroup.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return { group: shelfGroup, books };
}

// 좌하단에서 우하단으로 갈수록 책 밀도 줄이는 배치
function addBooksToShelfGradient(
  group,
  shelfWidth,
  shelfHeight,
  shelfDepth,
  panelThickness,
  shelfLevels
) {
  const usableWidth = shelfWidth - panelThickness * 2 - 0.8;
  const startX = -shelfWidth / 2 + panelThickness + 0.4;
  const endX = shelfWidth / 2 - panelThickness - 0.4;

  const bookDepth = shelfDepth - panelThickness * 2 - 0.04; // 뒤/앞판과 살짝 띄움
  const colors = [0xffebe0, 0xffcfd2, 0xf9b4ab, 0xbce6ff, 0xacc3ff, 0xd6e4f5, 0xf2e6b8];

  const startY = -shelfHeight / 2 + panelThickness * 2;
  const shelfSpacing = (shelfHeight - panelThickness * 2) / (shelfLevels + 1);
  const bookMeshes = [];

  for (let row = 0; row < shelfLevels; row += 1) {
    const rowY = startY + shelfSpacing * (row + 1);
    const rowNorm = row / Math.max(1, shelfLevels - 1);

    let x = startX;
    let i = 0;
    while (x < endX) {
      const seed = row * 101 + i * 37;

      const thickness = 0.22 + seededNoise(seed + 5) * 0.22;
      const gap = THREE.MathUtils.lerp(0.08, 0.16, seededNoise(seed + 9));

      const t = (x - startX) / usableWidth;

      const density =
        1.0 -
        0.65 * t -
        0.2 * rowNorm +
        0.08 * (seededNoise(seed + 11) - 0.5);

      if (density > 0.35) {
        const height = THREE.MathUtils.lerp(
          0.9,
          Math.max(1.7, shelfHeight * 0.22),
          seededNoise(seed)
        );
        const bookGeometry = new THREE.BoxGeometry(thickness, height, bookDepth);
        const bookMaterial = new THREE.MeshStandardMaterial({
          color: colors[(row * 17 + i) % colors.length],
          roughness: 0.42,
          metalness: 0.05,
          emissive: new THREE.Color(0xffe2c5).multiplyScalar(0.05),
        });

        const book = new THREE.Mesh(bookGeometry, bookMaterial);
        book.position.set(x + thickness / 2, rowY + height / 2, 0);
        book.rotation.z = (seededNoise(seed + 13) - 0.5) * 0.12;
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
        x += THREE.MathUtils.lerp(0.18, 0.32, seededNoise(seed + 21));
      }
      i += 1;
    }
  }

  return bookMeshes;
}

// ------------------------- 테이블 & 의자 -------------------------
function createTableAndChairs() {
  const { width, depth, floorLevel } = ROOM_SIZE;

  // 배치: 방 중앙보다 우측으로, 계단(좌측 벽)과 간섭 회피
  const posX = width * 0.18;
  const posZ = -depth * 0.06;

  const table = createWoodTable();
  table.position.set(posX, floorLevel, posZ);

  const chair1 = createWoodChair();
  chair1.position.set(posX - 1.2, floorLevel, posZ + 0.9);
  chair1.rotation.y = Math.PI * 0.05;

  const chair2 = createWoodChair();
  chair2.position.set(posX + 1.25, floorLevel, posZ - 0.9);
  chair2.rotation.y = Math.PI + Math.PI * 0.04;

  return { table, chairs: [chair1, chair2] };
}

function createWoodTable() {
  const group = new THREE.Group();

  const topW = 3.2;
  const topD = 1.8;
  const topT = 0.16;
  const legH = 1.0;
  const legT = 0.16;

  const wood = new THREE.MeshStandardMaterial({
    color: 0xb78963,
    roughness: 0.55,
    metalness: 0.08,
    emissive: new THREE.Color(0x3c2416).multiplyScalar(0.04),
  });

  const top = new THREE.Mesh(new THREE.BoxGeometry(topW, topT, topD), wood);
  top.position.y = legH + topT / 2;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  const legGeom = new THREE.BoxGeometry(legT, legH, legT);
  const offsets = [
    [-topW / 2 + legT / 2 + 0.04, legH / 2, -topD / 2 + legT / 2 + 0.04],
    [ topW / 2 - legT / 2 - 0.04, legH / 2, -topD / 2 + legT / 2 + 0.04],
    [-topW / 2 + legT / 2 + 0.04, legH / 2,  topD / 2 - legT / 2 - 0.04],
    [ topW / 2 - legT / 2 - 0.04, legH / 2,  topD / 2 - legT / 2 - 0.04],
  ];
  for (const [x, y, z] of offsets) {
    const leg = new THREE.Mesh(legGeom, wood);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    leg.receiveShadow = true;
    group.add(leg);
  }

  // 테두리 라우터 느낌
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(topW * 0.96, topT * 0.5, topD * 0.96),
    new THREE.MeshStandardMaterial({
      color: 0x9f7a56,
      roughness: 0.48,
      metalness: 0.1,
    })
  );
  trim.position.y = top.position.y - topT * 0.4;
  trim.castShadow = true;
  trim.receiveShadow = true;
  group.add(trim);

  group.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return group;
}

function createWoodChair() {
  const group = new THREE.Group();

  const seatW = 1.0;
  const seatD = 1.0;
  const seatT = 0.12;
  const legH = 0.8;
  const legT = 0.12;
  const backH = 1.0;
  const backT = 0.1;

  const wood = new THREE.MeshStandardMaterial({
    color: 0xb98761,
    roughness: 0.56,
    metalness: 0.08,
    emissive: new THREE.Color(0x3a2214).multiplyScalar(0.04),
  });

  const seat = new THREE.Mesh(new THREE.BoxGeometry(seatW, seatT, seatD), wood);
  seat.position.y = legH + seatT / 2;
  group.add(seat);

  const legGeom = new THREE.BoxGeometry(legT, legH, legT);
  const offsets = [
    [-seatW / 2 + legT / 2, legH / 2, -seatD / 2 + legT / 2],
    [ seatW / 2 - legT / 2, legH / 2, -seatD / 2 + legT / 2],
    [-seatW / 2 + legT / 2, legH / 2,  seatD / 2 - legT / 2],
    [ seatW / 2 - legT / 2, legH / 2,  seatD / 2 - legT / 2],
  ];
  for (const [x, y, z] of offsets) {
    const leg = new THREE.Mesh(legGeom, wood);
    leg.position.set(x, y, z);
    group.add(leg);
  }

  const back = new THREE.Mesh(new THREE.BoxGeometry(seatW, backH, backT), wood);
  back.position.set(0, legH + seatT + backH / 2 - 0.08, -seatD / 2 + backT / 2);
  group.add(back);

  group.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return group;
}

// ------------------------- 공용 프레임 -------------------------
function createRectangularFrame({ width, height, border, depth, frameColor, canvasColor }) {
  const outer = new THREE.Shape();
  outer.moveTo(-width / 2 - border, -height / 2 - border);
  outer.lineTo(width / 2 + border, -height / 2 - border);
  outer.lineTo(width / 2 + border, height / 2 + border);
  outer.lineTo(-width / 2 - border, height / 2 + border);
  outer.lineTo(-width / 2 - border, -height / 2 - border);

  const innerHole = new THREE.Path();
  innerHole.moveTo(-width / 2, -height / 2);
  innerHole.lineTo(width / 2, -height / 2);
  innerHole.lineTo(width / 2, height / 2);
  innerHole.lineTo(-width / 2, height / 2);
  innerHole.lineTo(-width / 2, -height / 2);
  outer.holes.push(innerHole);

  const frameGeometry = new THREE.ExtrudeGeometry(outer, { depth, bevelEnabled: false });
  frameGeometry.center();

  const frameMat = new THREE.MeshStandardMaterial({
    color: frameColor,
    roughness: 0.6,
    metalness: 0.15,
  });

  const canvasMat = new THREE.MeshStandardMaterial({
    color: canvasColor,
    roughness: 0.9,
    metalness: 0.02,
  });

  const frameMesh = new THREE.Mesh(frameGeometry, frameMat);

  const canvasGeometry = new THREE.PlaneGeometry(width, height);
  const canvasMesh = new THREE.Mesh(canvasGeometry, canvasMat);
  canvasMesh.position.z = depth / 2 + 0.01;

  const group = new THREE.Group();
  group.add(frameMesh);
  group.add(canvasMesh);
  group.castShadow = true;
  group.receiveShadow = true;

  return group;
}

function createCircularFrame({ radius, border, depth, frameColor, canvasColor }) {
  const outer = new THREE.Shape();
  outer.absarc(0, 0, radius + border, 0, Math.PI * 2, false);

  const hole = new THREE.Path();
  hole.absarc(0, 0, radius, 0, Math.PI * 2, true);
  outer.holes.push(hole);

  const frameGeometry = new THREE.ExtrudeGeometry(outer, { depth, bevelEnabled: false });
  frameGeometry.center();

  const frameMat = new THREE.MeshStandardMaterial({
    color: frameColor,
    roughness: 0.55,
    metalness: 0.18,
  });

  const canvasMat = new THREE.MeshStandardMaterial({
    color: canvasColor,
    roughness: 0.85,
    metalness: 0.04,
  });

  const frameMesh = new THREE.Mesh(frameGeometry, frameMat);

  const canvasGeometry = new THREE.CircleGeometry(radius, 64);
  const canvasMesh = new THREE.Mesh(canvasGeometry, canvasMat);
  canvasMesh.position.z = depth / 2 + 0.01;

  const group = new THREE.Group();
  group.add(frameMesh, canvasMesh);
  group.castShadow = true;
  group.receiveShadow = true;

  return group;
}

function seededNoise(seed) {
  return (Math.sin(seed * 127.1) + 1) / 2;
}
