import * as THREE from "three";

const ROOM_SIZE = Object.freeze({
  width: 26,
  depth: 24,
  height: 16,
  floorLevel: -6,
});

const WALL_THICKNESS = 0.6;
const FLOOR_THICKNESS = 0.9;
const BASE_OFFSET = 2.2;

export function initializeWinterRoomScene(scene) {
  const roomGroup = new THREE.Group();
  roomGroup.name = "WinterRoom";

  createFoundation(roomGroup);
  createFloor(roomGroup);
  createWalls(roomGroup);
  createCeilingCove(roomGroup);
  createWindow(roomGroup);

  scene.add(roomGroup);
  scene.fog = new THREE.Fog(0x0f1b2d, 80, 160);
}

function createFoundation(parent) {
  const { width, depth, floorLevel } = ROOM_SIZE;
  const foundationHeight = 1.6;

  const foundation = new THREE.Mesh(
    new THREE.BoxGeometry(width + BASE_OFFSET, foundationHeight, depth + BASE_OFFSET),
    new THREE.MeshStandardMaterial({
      color: 0x567a92,
      roughness: 0.95,
      metalness: 0.05,
    })
  );
  foundation.position.y = floorLevel - FLOOR_THICKNESS - foundationHeight / 2;
  foundation.receiveShadow = true;
  parent.add(foundation);
}

function createFloor(parent) {
  const { width, depth, floorLevel } = ROOM_SIZE;

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xdbe8f5,
    roughness: 0.85,
    metalness: 0.08,
  });

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(width, FLOOR_THICKNESS, depth),
    floorMaterial
  );
  floor.position.y = floorLevel - FLOOR_THICKNESS / 2;
  floor.receiveShadow = true;
  parent.add(floor);

  const trimMaterial = new THREE.MeshStandardMaterial({
    color: 0xb4cbe1,
    roughness: 0.6,
    metalness: 0.18,
  });

  const trimHeight = 0.45;
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(width - 1.4, trimHeight, depth - 1.4),
    trimMaterial
  );
  trim.position.y = floorLevel + trimHeight / 2;
  trim.castShadow = false;
  trim.receiveShadow = false;
  parent.add(trim);
}

function createWalls(parent) {
  const { width, depth, height, floorLevel } = ROOM_SIZE;

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2f7fc,
    roughness: 0.78,
    metalness: 0.12,
    emissive: new THREE.Color(0x13283d).multiplyScalar(0.08),
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0xbdd7f4,
    roughness: 0.7,
    metalness: 0.18,
  });

  const exitDetails = createLeftWallWithExit({
    width,
    depth,
    height,
    floorLevel,
    material: wallMaterial,
    parent,
  });

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, WALL_THICKNESS),
    wallMaterial
  );
  backWall.position.set(0, floorLevel + height / 2, -depth / 2 + WALL_THICKNESS / 2);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  parent.add(backWall);

  createExitStairs(parent, {
    exitBottomY: exitDetails.exitBottomY,
    exitCenterZ: exitDetails.exitCenterZ,
    exitWidth: exitDetails.exitWidth,
    floorLevel,
    wallInnerX: exitDetails.wallInnerX,
  });

  const baseboardHeight = 0.65;
  const baseboardDepth = 0.3;

  const leftBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(baseboardDepth, baseboardHeight, depth),
    accentMaterial
  );
  leftBaseboard.position.set(
    -width / 2 + baseboardDepth / 2,
    floorLevel + baseboardHeight / 2,
    0
  );
  parent.add(leftBaseboard);

  const backBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(width, baseboardHeight, baseboardDepth),
    accentMaterial
  );
  backBaseboard.position.set(
    0,
    floorLevel + baseboardHeight / 2,
    -depth / 2 + baseboardDepth / 2
  );
  parent.add(backBaseboard);
}

function createLeftWallWithExit({
  width,
  depth,
  height,
  floorLevel,
  material,
  parent,
}) {
  const halfHeight = height / 2;
  const halfDepth = depth / 2;

  const exitOpening = Object.freeze({
    width: 4.4,
    height: 4.8,
    ceilingOffset: 1.2,
    frontInset: 1.6,
  });

  const wallShape = new THREE.Shape();
  wallShape.moveTo(-halfDepth, -halfHeight);
  wallShape.lineTo(halfDepth, -halfHeight);
  wallShape.lineTo(halfDepth, halfHeight);
  wallShape.lineTo(-halfDepth, halfHeight);
  wallShape.closePath();

  const exitCenterZ =
    halfDepth - exitOpening.frontInset - exitOpening.width / 2;
  const exitBottomRelative =
    halfHeight - exitOpening.ceilingOffset - exitOpening.height;

  const exitHole = new THREE.Path();
  exitHole.moveTo(
    exitCenterZ - exitOpening.width / 2,
    exitBottomRelative
  );
  exitHole.lineTo(
    exitCenterZ - exitOpening.width / 2,
    exitBottomRelative + exitOpening.height
  );
  exitHole.lineTo(
    exitCenterZ + exitOpening.width / 2,
    exitBottomRelative + exitOpening.height
  );
  exitHole.lineTo(
    exitCenterZ + exitOpening.width / 2,
    exitBottomRelative
  );
  exitHole.closePath();

  wallShape.holes.push(exitHole);

  const geometry = new THREE.ExtrudeGeometry(wallShape, {
    depth: WALL_THICKNESS,
    bevelEnabled: false,
  });
  geometry.translate(0, 0, -WALL_THICKNESS / 2);
  geometry.rotateY(-Math.PI / 2);

  const leftWall = new THREE.Mesh(geometry, material);
  leftWall.position.set(
    -width / 2 + WALL_THICKNESS / 2,
    floorLevel + halfHeight,
    0
  );
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  leftWall.name = "LeftWallWithExit";
  parent.add(leftWall);

  return {
    exitBottomY: floorLevel + halfHeight + exitBottomRelative,
    exitCenterZ,
    exitWidth: exitOpening.width,
    wallInnerX: -width / 2 + WALL_THICKNESS,
  };
}

function createExitStairs(parent, { exitBottomY, exitCenterZ, exitWidth, floorLevel, wallInnerX }) {
  const floorTopY = floorLevel;
  const totalRise = exitBottomY - floorTopY;
  const steps = 6;
  const stepHeight = totalRise / steps;
  const stepDepth = 1.35;
  const stepWidth = exitWidth + 1.4;

  const stairMaterial = new THREE.MeshStandardMaterial({
    color: 0xc7d9eb,
    roughness: 0.65,
    metalness: 0.12,
    emissive: new THREE.Color(0x13283d).multiplyScalar(0.05),
  });

  const stairsGroup = new THREE.Group();
  stairsGroup.name = "ExitStairs";

  const topStepX = wallInnerX + stepDepth / 2;

  for (let i = 0; i < steps; i += 1) {
    const stepGeometry = new THREE.BoxGeometry(stepDepth, stepHeight, stepWidth);
    const step = new THREE.Mesh(stepGeometry, stairMaterial);
    step.castShadow = true;
    step.receiveShadow = true;

    const x = topStepX + (steps - 1 - i) * stepDepth;
    const y = floorTopY + stepHeight * (i + 0.5);
    step.position.set(x, y, exitCenterZ);
    stairsGroup.add(step);
  }

  const landingDepth = stepDepth * 0.9;
  const landingHeight = stepHeight * 0.9;
  const landing = new THREE.Mesh(
    new THREE.BoxGeometry(landingDepth, landingHeight, exitWidth + 0.6),
    stairMaterial
  );
  landing.castShadow = true;
  landing.receiveShadow = true;
  landing.position.set(
    wallInnerX - landingDepth / 2,
    exitBottomY - landingHeight / 2,
    exitCenterZ
  );
  stairsGroup.add(landing);

  parent.add(stairsGroup);
}

function createCeilingCove(parent) {
  const { width, depth, height, floorLevel } = ROOM_SIZE;
  const coveHeight = 0.9;

  const coveMaterial = new THREE.MeshStandardMaterial({
    color: 0xcfe2f7,
    roughness: 0.55,
    metalness: 0.2,
    emissive: new THREE.Color(0x7cc6ff).multiplyScalar(0.2),
  });

  const leftCove = new THREE.Mesh(
    new THREE.BoxGeometry(WALL_THICKNESS + 0.2, coveHeight, depth - 1.2),
    coveMaterial
  );
  leftCove.position.set(
    -width / 2 + WALL_THICKNESS / 2,
    floorLevel + height - coveHeight / 2,
    0.3
  );
  parent.add(leftCove);

  const backCove = new THREE.Mesh(
    new THREE.BoxGeometry(width - 1.2, coveHeight, WALL_THICKNESS + 0.2),
    coveMaterial
  );
  backCove.position.set(
    0.3,
    floorLevel + height - coveHeight / 2,
    -depth / 2 + WALL_THICKNESS / 2
  );
  parent.add(backCove);
}

function createWindow(parent) {
  const { width, floorLevel, depth } = ROOM_SIZE;

  const windowWidth = 9.5;
  const windowHeight = 7;
  const sillHeight = 3.5;
  const frameThickness = 0.35;

  const windowGroup = new THREE.Group();
  windowGroup.position.set(-width / 2 + WALL_THICKNESS / 2 + 0.01, 0, -depth / 3);
  windowGroup.rotation.y = Math.PI / 2;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xa3c5e6,
    roughness: 0.45,
    metalness: 0.25,
  });

  const verticalFrameGeometry = new THREE.BoxGeometry(frameThickness, windowHeight, frameThickness);
  const horizontalFrameGeometry = new THREE.BoxGeometry(windowWidth + frameThickness, frameThickness, frameThickness);

  const leftFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
  leftFrame.position.set(-windowWidth / 2 - frameThickness / 2, floorLevel + sillHeight + windowHeight / 2, 0);
  windowGroup.add(leftFrame);

  const rightFrame = leftFrame.clone();
  rightFrame.position.x = windowWidth / 2 + frameThickness / 2;
  windowGroup.add(rightFrame);

  const topFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
  topFrame.position.set(0, floorLevel + sillHeight + windowHeight + frameThickness / 2, 0);
  windowGroup.add(topFrame);

  const bottomFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
  bottomFrame.position.set(0, floorLevel + sillHeight - frameThickness / 2, 0);
  windowGroup.add(bottomFrame);

  const muntin = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
  muntin.scale.set(0.45, 1, 1);
  muntin.position.set(0, floorLevel + sillHeight + windowHeight / 2, 0);
  windowGroup.add(muntin);

  const glazing = new THREE.Mesh(
    new THREE.PlaneGeometry(windowWidth, windowHeight),
    new THREE.MeshPhysicalMaterial({
      color: 0xb9dcff,
      transmission: 0.75,
      opacity: 0.9,
      roughness: 0.25,
      thickness: 0.4,
      transparent: true,
    })
  );
  glazing.position.set(0, floorLevel + sillHeight + windowHeight / 2, frameThickness / 2);
  glazing.receiveShadow = false;
  glazing.castShadow = false;
  windowGroup.add(glazing);

  const frostGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(windowWidth + 0.8, windowHeight + 0.8),
    new THREE.MeshBasicMaterial({
      color: 0x6fb9ff,
      transparent: true,
      opacity: 0.12,
    })
  );
  frostGlow.position.set(0, floorLevel + sillHeight + windowHeight / 2, -frameThickness / 2 - 0.01);
  windowGroup.add(frostGlow);

  parent.add(windowGroup);
}
