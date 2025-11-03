import * as THREE from "three";
import { ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

export function addDecor(parent) {
  const frames = createGalleryWall();
  const bookshelf = createBookshelf();

  frames.forEach((frame) => parent.add(frame));
  parent.add(bookshelf);
}

function createGalleryWall() {
  const { width, height, floorLevel, depth } = ROOM_SIZE;
  const mountZ = -depth / 2 + WALL_THICKNESS / 2 + 0.04;

  const frames = [];

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

  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: 0xcaa77a,
    roughness: 0.55,
    metalness: 0.1,
    emissive: new THREE.Color(0x4a2e1c).multiplyScalar(0.06),
  });

  const sideGeometry = new THREE.BoxGeometry(panelThickness, shelfHeight, shelfDepth);
  const topBottomGeometry = new THREE.BoxGeometry(shelfWidth, panelThickness, shelfDepth);

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
    const shelf = new THREE.Mesh(topBottomGeometry, shelfMaterial);
    shelf.scale.y = 0.5;
    shelf.position.y = -shelfHeight / 2 + (shelfHeight / (shelfLevels + 1)) * i;
    shelfGroup.add(shelf);
  }

  addBooksToShelf(shelfGroup, shelfWidth, shelfHeight, shelfDepth, panelThickness);

  shelfGroup.position.set(
    width / 2 - shelfWidth / 2 - 1.2,
    floorLevel + height - shelfHeight / 2 - 1.8,
    -depth / 2 + WALL_THICKNESS + shelfDepth / 2 + 0.02
  );

  return shelfGroup;
}

function addBooksToShelf(group, shelfWidth, shelfHeight, shelfDepth, panelThickness) {
  const bookDepth = shelfDepth - panelThickness * 2;
  const bookHeightRange = [0.8, 1.6];
  const colors = [0xffebe0, 0xffcfd2, 0xf9b4ab, 0xbce6ff, 0xacc3ff, 0xd6e4f5];

  const startY = -shelfHeight / 2 + panelThickness * 2;
  const shelfSpacing = (shelfHeight - panelThickness * 2) / 4;

  for (let row = 0; row < 3; row += 1) {
    const booksInRow = 7 + row * 2;
    const rowY = startY + shelfSpacing * (row + 1);
    let offsetX = -shelfWidth / 2 + panelThickness + 0.4;

    for (let i = 0; i < booksInRow; i += 1) {
      const seed = row * 31 + i * 17;
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
      book.rotation.z = (seededNoise(seed + 11) - 0.5) * 0.12;
      book.castShadow = true;
      book.receiveShadow = true;

      group.add(book);
      offsetX += thickness + 0.12;

      if (offsetX > shelfWidth / 2 - panelThickness - 0.4) {
        break;
      }
    }
  }
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
    metalness: 0.26,
    roughness: 0.32,
    emissive: new THREE.Color(frameColor).multiplyScalar(0.06),
  });

  const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
  frameMesh.castShadow = true;

  const artCanvas = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      color: canvasColor,
      emissive: new THREE.Color(canvasColor).multiplyScalar(0.1),
      roughness: 0.88,
      metalness: 0.04,
    })
  );
  artCanvas.position.z = depth / 2 + 0.02;

  const frameGroup = new THREE.Group();
  frameGroup.add(frameMesh);
  frameGroup.add(artCanvas);

  return frameGroup;
}

function createCircularFrame({ radius, border, depth, frameColor, canvasColor }) {
  const outerRadius = radius + border;

  const frameShape = new THREE.Shape();
  frameShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
  const innerHole = new THREE.Path();
  innerHole.absarc(0, 0, radius, 0, Math.PI * 2, true);
  frameShape.holes.push(innerHole);

  const frameGeometry = new THREE.ExtrudeGeometry(frameShape, {
    depth,
    bevelEnabled: false,
  });
  frameGeometry.center();

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: frameColor,
    metalness: 0.24,
    roughness: 0.3,
    emissive: new THREE.Color(frameColor).multiplyScalar(0.08),
  });

  const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;

  const artCanvas = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    new THREE.MeshStandardMaterial({
      color: canvasColor,
      emissive: new THREE.Color(canvasColor).multiplyScalar(0.08),
      roughness: 0.9,
      metalness: 0.03,
    })
  );
  artCanvas.position.z = depth / 2 + 0.02;

  const frameGroup = new THREE.Group();
  frameGroup.add(frameMesh);
  frameGroup.add(artCanvas);

  frameGroup.castShadow = true;

  return frameGroup;
}
