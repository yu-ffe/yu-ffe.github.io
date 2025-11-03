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
  const shelfWidth = 6.4;
  const shelfHeight = 4.6;
  const shelfDepth = 1.2;
  const panelThickness = 0.22;

  // Stream_LiveGame :: 책장 전체에 사용할 나무 재질.
  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: 0xcaa77a,
    roughness: 0.55,
    metalness: 0.1,
    emissive: new THREE.Color(0x4a2e1c).multiplyScalar(0.06),
  });

  const sideGeometry = new THREE.BoxGeometry(panelThickness, shelfHeight, shelfDepth);
  const topBottomGeometry = new THREE.BoxGeometry(shelfWidth, panelThickness, shelfDepth);

  // Stream_LiveGame :: 좌우 기둥과 상판/하판을 배치한다.
  const leftSide = new THREE.Mesh(sideGeometry, shelfMaterial);
  leftSide.position.x = -shelfWidth / 2 + panelThickness / 2;
  shelfGroup.add(leftSide);

  const rightSide = leftSide.clone();
  rightSide.position.x = shelfWidth / 2 - panelThickness / 2;
  shelfGroup.add(rightSide);

  const topPanel = new THREE.Mesh(topBottomGeometry, shelfMaterial);
  topPanel.position.y = shelfHeight / 2 - panelThickness / 2;
  shelfGroup.add(topPanel);

  const bottomPanel = topPanel.clone();
  bottomPanel.position.y = -shelfHeight / 2 + panelThickness / 2;
  shelfGroup.add(bottomPanel);

  const shelfLevels = 3;
  for (let i = 1; i <= shelfLevels; i += 1) {
    // Stream_LiveGame :: 각 층마다 얇은 선반을 추가한다.
    const shelf = new THREE.Mesh(topBottomGeometry, shelfMaterial);
    shelf.scale.y = 0.5;
    shelf.position.y = -shelfHeight / 2 + (shelfHeight / (shelfLevels + 1)) * i;
    shelfGroup.add(shelf);
  }

  // Stream_LiveGame :: 책장을 풍성하게 보이게 하기 위해 책을 채운다.
  const books = addBooksToShelf(
    shelfGroup,
    shelfWidth,
    shelfHeight,
    shelfDepth,
    panelThickness
  );

  shelfGroup.position.set(
    width / 2 - shelfWidth / 2 - 1.2,
    floorLevel + height - shelfHeight / 2 - 1.8,
    -depth / 2 + WALL_THICKNESS + shelfDepth / 2 + 0.02
  );

  return {
    group: shelfGroup,
    books,
  };
}

function addBooksToShelf(group, shelfWidth, shelfHeight, shelfDepth, panelThickness) {
  const bookDepth = shelfDepth - panelThickness * 2;
  const bookHeightRange = [0.8, 1.6];
  const colors = [0xffebe0, 0xffcfd2, 0xf9b4ab, 0xbce6ff, 0xacc3ff, 0xd6e4f5];

  const startY = -shelfHeight / 2 + panelThickness * 2;
  const shelfSpacing = (shelfHeight - panelThickness * 2) / 4;
  const bookMeshes = [];

  for (let row = 0; row < 3; row += 1) {
    const booksInRow = 7 + row * 2;
    const rowY = startY + shelfSpacing * (row + 1);
    let offsetX = -shelfWidth / 2 + panelThickness + 0.4;

    for (let i = 0; i < booksInRow; i += 1) {
      const seed = row * 31 + i * 17;
      // Stream_LiveGame :: 책 높이와 두께를 시드 기반으로 변형.
      const height = THREE.MathUtils.lerp(
        bookHeightRange[0],
        bookHeightRange[1],
        seededNoise(seed)
      );
      const thickness = 0.22 + seededNoise(seed + 5) * 0.18;
      const bookGeometry = new THREE.BoxGeometry(thickness, height, bookDepth);
      const bookMaterial = new THREE.MeshStandardMaterial({
        color: colors[(row * booksInRow + i) % colors.length],
        roughness: 0.4,
        metalness: 0.05,
        emissive: new THREE.Color(0xffe2c5).multiplyScalar(0.06),
      });

      const book = new THREE.Mesh(bookGeometry, bookMaterial);
      book.position.set(offsetX + thickness / 2, rowY + height / 2, 0);
      // Stream_LiveGame :: 약간 기울여 자연스러운 배열을 만든다.
      book.rotation.z = (seededNoise(seed + 11) - 0.5) * 0.12;
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
      offsetX += thickness + 0.12;

      if (offsetX > shelfWidth / 2 - panelThickness - 0.4) {
        // Stream_LiveGame :: 선반 너비를 초과하면 다음 줄로 넘어간다.
        break;
      }
    }
  }

  return bookMeshes;
}

function seededNoise(seed) {
  // Stream_LiveGame :: 사인 함수를 이용한 결정적 노이즈 함수.
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
