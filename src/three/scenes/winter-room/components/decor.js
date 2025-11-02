import * as THREE from "three";
import { ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

export function addDecor(parent) {
  const frame = createPictureFrame();
  const bookshelf = createBookshelf();

  parent.add(frame);
  parent.add(bookshelf);
}

function createPictureFrame() {
  const { width, height, floorLevel, depth } = ROOM_SIZE;

  const frameWidth = 3.6;
  const frameHeight = 2.6;
  const frameDepth = 0.18;
  const borderThickness = 0.35;

  const outerShape = new THREE.Shape();
  outerShape.moveTo(-frameWidth / 2 - borderThickness, -frameHeight / 2 - borderThickness);
  outerShape.lineTo(frameWidth / 2 + borderThickness, -frameHeight / 2 - borderThickness);
  outerShape.lineTo(frameWidth / 2 + borderThickness, frameHeight / 2 + borderThickness);
  outerShape.lineTo(-frameWidth / 2 - borderThickness, frameHeight / 2 + borderThickness);
  outerShape.lineTo(-frameWidth / 2 - borderThickness, -frameHeight / 2 - borderThickness);

  const innerHole = new THREE.Path();
  innerHole.moveTo(-frameWidth / 2, -frameHeight / 2);
  innerHole.lineTo(frameWidth / 2, -frameHeight / 2);
  innerHole.lineTo(frameWidth / 2, frameHeight / 2);
  innerHole.lineTo(-frameWidth / 2, frameHeight / 2);
  innerHole.lineTo(-frameWidth / 2, -frameHeight / 2);
  outerShape.holes.push(innerHole);

  const frameGeometry = new THREE.ExtrudeGeometry(outerShape, {
    depth: frameDepth,
    bevelEnabled: false,
  });
  frameGeometry.center();

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xdcb48e,
    metalness: 0.25,
    roughness: 0.35,
    emissive: new THREE.Color(0x6f3a1f).multiplyScalar(0.08),
  });

  const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
  frameMesh.castShadow = true;

  const artCanvas = new THREE.Mesh(
    new THREE.PlaneGeometry(frameWidth, frameHeight),
    new THREE.MeshStandardMaterial({
      color: 0x92c5ff,
      emissive: new THREE.Color(0xffc48c).multiplyScalar(0.12),
      roughness: 0.9,
      metalness: 0.05,
    })
  );
  artCanvas.position.z = frameDepth / 2 + 0.02;

  const frameGroup = new THREE.Group();
  frameGroup.add(frameMesh);
  frameGroup.add(artCanvas);

  frameGroup.position.set(
    -width / 2 + WALL_THICKNESS + frameDepth / 2 + 0.05,
    floorLevel + height - frameHeight - 1.6,
    depth / 2 - 5.8
  );
  frameGroup.rotation.y = Math.PI / 2;

  return frameGroup;
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
