import * as THREE from "three";
import { WALL_THICKNESS } from "../constants.js";

export function addEscapeStairs(parent, config) {
  if (!config) {
    return;
  }

  const { floorLevel, holeBottomY, holeCenterZ, holeWidth, roomWidth } = config;
  const stepCount = 7;
  const stepDepth = 1.1;
  const wallGap = 0.08;
  const stairsWidth = holeWidth + 1.2;
  const stepHeight = (holeBottomY - floorLevel) / stepCount;
  const wallInnerFaceX = -roomWidth / 2 + WALL_THICKNESS;
  const topStepCenterX = wallInnerFaceX + wallGap + stepDepth / 2;

  const stairMaterial = new THREE.MeshStandardMaterial({
    color: 0x9baaba,
    roughness: 0.58,
    metalness: 0.16,
    emissive: new THREE.Color(0x0f1d2c).multiplyScalar(0.08),
  });

  const stairsGroup = new THREE.Group();
  stairsGroup.name = "EscapeStairs";
  parent.add(stairsGroup);

  for (let i = 0; i < stepCount; i += 1) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(stepDepth, stepHeight, stairsWidth),
      stairMaterial
    );
    const horizontalIndex = stepCount - 1 - i;
    step.position.set(
      topStepCenterX + horizontalIndex * stepDepth,
      floorLevel + stepHeight * (i + 0.5),
      holeCenterZ
    );
    step.castShadow = true;
    step.receiveShadow = true;
    stairsGroup.add(step);
  }
}
