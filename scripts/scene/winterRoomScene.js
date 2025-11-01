import * as THREE from "three";
import { CSG } from "../libs/esm/CSG.js";

const ROOM_SIZE = Object.freeze({
  width: 26,
  depth: 24,
  height: 16,
  floorLevel: -6,
});

const WALL_THICKNESS = 0.6;
const FLOOR_THICKNESS = 0.9;
const BASE_OFFSET = 2.2;
const FRONT_OPEN_OFFSET = 6;

const WINDOW_CONFIG = Object.freeze({
  width: 9.5,
  height: 7,
  sillHeight: 3.5,
  frameThickness: 0.35,
  depthOffset: -7,
});

export function initializeWinterRoomScene(scene) {
  const roomGroup = new THREE.Group();
  roomGroup.name = "WinterRoom";

  createFoundation(roomGroup);
  createFloor(roomGroup);
  createWalls(roomGroup);
  createCeilingCove(roomGroup);
  createFrontFrame(roomGroup);
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

  const sideWallDepth = depth - FRONT_OPEN_OFFSET;

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(WALL_THICKNESS, height, sideWallDepth),
    wallMaterial
  );
  leftWall.position.set(
    -width / 2 + WALL_THICKNESS / 2,
    floorLevel + height / 2,
    -FRONT_OPEN_OFFSET / 2
  );
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  parent.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(WALL_THICKNESS, height, sideWallDepth),
    wallMaterial
  );
  rightWall.position.set(
    width / 2 - WALL_THICKNESS / 2,
    floorLevel + height / 2,
    -FRONT_OPEN_OFFSET / 2
  );
  rightWall.updateMatrix();

  const windowOpening = new THREE.Mesh(
    new THREE.BoxGeometry(WALL_THICKNESS + 0.12, WINDOW_CONFIG.height + 0.6, WINDOW_CONFIG.width + 0.6)
  );
  windowOpening.position.set(
    width / 2 - WALL_THICKNESS / 2 + 0.01,
    floorLevel + WINDOW_CONFIG.sillHeight + WINDOW_CONFIG.height / 2,
    WINDOW_CONFIG.depthOffset
  );
  windowOpening.updateMatrix();

  const rightWallWithWindow = CSG.toMesh(
    CSG.fromMesh(rightWall).subtract(CSG.fromMesh(windowOpening)),
    rightWall.matrix,
    wallMaterial
  );
  rightWallWithWindow.castShadow = true;
  rightWallWithWindow.receiveShadow = true;
  parent.add(rightWallWithWindow);

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, WALL_THICKNESS),
    wallMaterial
  );
  backWall.position.set(0, floorLevel + height / 2, -depth / 2 + WALL_THICKNESS / 2);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  parent.add(backWall);

  const baseboardHeight = 0.65;
  const baseboardDepth = 0.3;

  const leftBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(baseboardDepth, baseboardHeight, sideWallDepth - 0.6),
    accentMaterial
  );
  leftBaseboard.position.set(
    -width / 2 + baseboardDepth / 2,
    floorLevel + baseboardHeight / 2,
    -FRONT_OPEN_OFFSET / 2
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

  const rightBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(baseboardDepth, baseboardHeight, sideWallDepth - 0.6),
    accentMaterial
  );
  rightBaseboard.position.set(
    width / 2 - baseboardDepth / 2,
    floorLevel + baseboardHeight / 2,
    -FRONT_OPEN_OFFSET / 2
  );
  parent.add(rightBaseboard);
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

function createFrontFrame(parent) {
  const { width, depth, height, floorLevel } = ROOM_SIZE;
  const postRadius = 0.45;
  const postBottom = floorLevel + 0.2;
  const postTop = floorLevel + height - 0.5;
  const postTotalHeight = postTop - postBottom;
  const postCylinderLength = Math.max(postTotalHeight - postRadius * 2, 0.1);
  const postCenterY = (postTop + postBottom) / 2;
  const sideWallDepth = depth - FRONT_OPEN_OFFSET;
  const frontZ = -FRONT_OPEN_OFFSET / 2 + sideWallDepth / 2 - postRadius * 0.1;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xb9d1ed,
    roughness: 0.55,
    metalness: 0.22,
  });

  const leftPost = new THREE.Mesh(
    new THREE.CapsuleGeometry(postRadius, postCylinderLength, 8, 16),
    frameMaterial
  );
  leftPost.position.set(
    -width / 2 + WALL_THICKNESS + postRadius * 0.6,
    postCenterY,
    frontZ
  );
  leftPost.castShadow = true;
  leftPost.receiveShadow = true;
  parent.add(leftPost);

  const rightPost = leftPost.clone();
  rightPost.position.x = width / 2 - WALL_THICKNESS - postRadius * 0.6;
  parent.add(rightPost);

  const headerRadius = 0.35;
  const headerSpan = width - 2 * (WALL_THICKNESS + postRadius * 0.6);
  const headerCylinderLength = Math.max(headerSpan - headerRadius * 2, 0.1);

  const header = new THREE.Mesh(
    new THREE.CapsuleGeometry(headerRadius, headerCylinderLength, 6, 16),
    frameMaterial
  );
  header.rotation.z = Math.PI / 2;
  header.position.set(0, postTop - headerRadius * 0.2, frontZ);
  header.castShadow = true;
  header.receiveShadow = true;
  parent.add(header);
}

function createWindow(parent) {
  const { width, floorLevel } = ROOM_SIZE;
  const { width: windowWidth, height: windowHeight, sillHeight, frameThickness, depthOffset } =
    WINDOW_CONFIG;

  const windowGroup = new THREE.Group();
  windowGroup.position.set(width / 2 - WALL_THICKNESS / 2 - 0.01, 0, depthOffset);
  windowGroup.rotation.y = -Math.PI / 2;

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
