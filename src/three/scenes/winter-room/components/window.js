// Stream_LiveGame :: 창문 구성 요소 생성을 위해 Three.js를 사용한다.
import * as THREE from "three";
import { ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

export function addWindow(parent, opening = {}) {
  const { width, floorLevel, depth } = ROOM_SIZE;

  const openingWidth = opening.width ?? 9.5;
  const openingHeight = opening.height ?? 7;
  const openingBottomY = opening.bottomY ?? floorLevel + 3.5;
  const openingCenterZ = opening.centerZ ?? -depth / 3;

  const frameThickness = 0.35;
  const frameInset = 0.4;
  const windowWidth = Math.max(0.6, openingWidth - frameInset * 2);
  const windowHeight = Math.max(0.6, openingHeight - frameInset * 2);
  const sillHeight = Math.max(0, openingBottomY - floorLevel + frameInset);

  const windowGroup = new THREE.Group();
  windowGroup.position.set(-width / 2 + WALL_THICKNESS / 2 + 0.01, 0, openingCenterZ);
  windowGroup.rotation.y = Math.PI / 2;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xa3c5e6,
    roughness: 0.45,
    metalness: 0.25,
  });

  // Stream_LiveGame :: 기본적인 수직/수평 프레임 지오메트리를 준비한다.
  const verticalFrameGeometry = new THREE.BoxGeometry(frameThickness, windowHeight, frameThickness);
  const horizontalFrameGeometry = new THREE.BoxGeometry(
    windowWidth + frameThickness,
    frameThickness,
    frameThickness
  );

  // Stream_LiveGame :: 좌우 기둥 프레임을 배치한다.
  const leftFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
  leftFrame.position.set(-windowWidth / 2 - frameThickness / 2, floorLevel + sillHeight + windowHeight / 2, 0);
  windowGroup.add(leftFrame);

  const rightFrame = leftFrame.clone();
  rightFrame.position.x = windowWidth / 2 + frameThickness / 2;
  windowGroup.add(rightFrame);

  // Stream_LiveGame :: 상단, 하단 프레임과 중간 문살을 추가한다.
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

  // Stream_LiveGame :: 유리재질 평면을 만들어 빛을 통과시키는 효과를 준다.
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

  // Stream_LiveGame :: 창문에서 퍼지는 서리 빛을 표현하는 추가 평면.
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
