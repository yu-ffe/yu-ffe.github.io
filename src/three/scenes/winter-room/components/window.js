import * as THREE from "three";
import { ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

export function addWindow(parent) {
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
  const horizontalFrameGeometry = new THREE.BoxGeometry(
    windowWidth + frameThickness,
    frameThickness,
    frameThickness
  );

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
