// Stream_LiveGame :: 창문 구성 요소 생성을 위해 Three.js를 사용한다.
import * as THREE from "three";
import { ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

export function addWindow(parent, opening = {}) {
  const { width, floorLevel } = ROOM_SIZE;

  const openingWidth = opening.width ?? 9.5;
  const openingHeight = opening.height ?? 7;
  const openingBottomY = opening.bottomY ?? floorLevel + 3.5;
  const openingCenterZ = opening.centerZ ?? 0;

  const frameThickness = 0.35;
  const frameInset = 0.4;
  const windowWidth = Math.max(0.6, openingWidth - frameInset * 2);
  const windowHeight = Math.max(0.6, openingHeight - frameInset * 2);
  const sillHeight = Math.max(0, openingBottomY - floorLevel + frameInset);

  const windowGroup = new THREE.Group();
  // Slightly pull the window assembly toward the exterior so it no longer looks recessed.
  windowGroup.position.set(-width / 2 + WALL_THICKNESS / 2 - 0.05, 0, openingCenterZ);
  windowGroup.rotation.y = Math.PI / 2;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xa3c5e6,
    roughness: 0.45,
    metalness: 0.25,
    side: THREE.DoubleSide,
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

  const middleRail = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
  middleRail.scale.set(0.48, 1, 1);
  middleRail.position.set(0, floorLevel + sillHeight + windowHeight / 2, 0);
  windowGroup.add(middleRail);

  // Stream_LiveGame :: 이중 창문의 유리창과 프레임을 생성한다.
  const sashHeight = Math.max(0.4, (windowHeight - frameThickness * 1.6) / 2);
  const sashWidth = Math.max(0.4, windowWidth - frameThickness * 1.4);
  const sashSlideDistance = Math.max(0, sashHeight - frameThickness * 1.2);

  const glassParams = {
    color: 0xb9dcff,
    transmission: 0.78,
    opacity: 0.88,
    roughness: 0.22,
    thickness: 0.45,
    transparent: true,
    side: THREE.DoubleSide,
  };

  const sashFrameThickness = Math.max(0.12, frameThickness * 0.82);

  const createSash = () => {
    const sashGroup = new THREE.Group();

    const frameGeometry = createSashFrameGeometry(sashWidth, sashHeight, sashFrameThickness);
    const sashFrame = new THREE.Mesh(frameGeometry, frameMaterial.clone());
    sashFrame.castShadow = false;
    sashFrame.receiveShadow = false;
    sashFrame.position.z = sashFrameThickness / 2;
    sashGroup.add(sashFrame);

    const glassGeometry = new THREE.PlaneGeometry(
      Math.max(0.2, sashWidth - sashFrameThickness * 2),
      Math.max(0.2, sashHeight - sashFrameThickness * 2)
    );
    const glassMaterial = new THREE.MeshPhysicalMaterial({ ...glassParams });
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.z = sashFrameThickness / 2 + 0.01;
    glass.castShadow = false;
    glass.receiveShadow = false;
    sashGroup.add(glass);

    sashGroup.userData = {
      glassMaterial,
    };

    return sashGroup;
  };

  const topSash = createSash();
  const bottomSash = createSash();

  const topSashY = floorLevel + sillHeight + windowHeight - frameThickness - sashHeight / 2;
  const bottomSashBaseY = floorLevel + sillHeight + frameThickness + sashHeight / 2;
  const exteriorSashZ = frameThickness / 2 + 0.02;
  // Keep the bottom sash tucked just behind the exterior sash so it can slide without overlap.
  const sashDepthOffset = Math.min(sashFrameThickness * 0.75, frameThickness * 0.45);

  topSash.position.set(0, topSashY, exteriorSashZ);
  bottomSash.position.set(0, bottomSashBaseY, exteriorSashZ - sashDepthOffset);

  windowGroup.add(topSash);
  windowGroup.add(bottomSash);

  const slidingState = {
    current: 0,
    target: 0,
  };

  const updateSashPosition = () => {
    bottomSash.position.y = bottomSashBaseY + sashSlideDistance * slidingState.current;
  };

  const update = (delta) => {
    if (typeof delta !== "number" || Number.isNaN(delta)) {
      updateSashPosition();
      return;
    }

    const damped = THREE.MathUtils.damp(slidingState.current, slidingState.target, 6, delta);
    if (Math.abs(damped - slidingState.current) > 0.0001) {
      slidingState.current = damped;
      updateSashPosition();
    }
  };

  const toggle = () => {
    slidingState.target = slidingState.target > 0 ? 0 : 1;
  };

  update(0);

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

  return {
    group: windowGroup,
    interactionTarget: bottomSash,
    toggle,
    update,
    highlightMaterials: [bottomSash.userData?.glassMaterial].filter(Boolean),
  };
}

function createSashFrameGeometry(width, height, thickness) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfInnerWidth = Math.max(0, halfWidth - thickness);
  const halfInnerHeight = Math.max(0, halfHeight - thickness);

  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth, -halfHeight);
  shape.lineTo(halfWidth, -halfHeight);
  shape.lineTo(halfWidth, halfHeight);
  shape.lineTo(-halfWidth, halfHeight);
  shape.lineTo(-halfWidth, -halfHeight);

  const innerRect = new THREE.Path();
  innerRect.moveTo(-halfInnerWidth, -halfInnerHeight);
  innerRect.lineTo(halfInnerWidth, -halfInnerHeight);
  innerRect.lineTo(halfInnerWidth, halfInnerHeight);
  innerRect.lineTo(-halfInnerWidth, halfInnerHeight);
  innerRect.lineTo(-halfInnerWidth, -halfInnerHeight);
  shape.holes.push(innerRect);

  return new THREE.ShapeGeometry(shape);
}
