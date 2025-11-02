import * as THREE from "three";
import { FLOOR_THICKNESS, ROOM_SIZE } from "../constants.js";

export function addFloor(parent) {
  const { width, depth, floorLevel } = ROOM_SIZE;

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x392b21,
    roughness: 0.82,
    metalness: 0.05,
  });

  const baseFloor = new THREE.Mesh(
    new THREE.BoxGeometry(width, FLOOR_THICKNESS, depth),
    baseMaterial
  );
  baseFloor.position.y = floorLevel - FLOOR_THICKNESS / 2;
  baseFloor.receiveShadow = true;
  parent.add(baseFloor);

  const plankGroup = new THREE.Group();
  plankGroup.position.y = floorLevel + 0.02;

  const plankCount = 12;
  const plankGap = 0.12;
  const plankWidth = width / plankCount;
  const plankHeight = 0.18;

  const plankGeometry = new THREE.BoxGeometry(
    plankWidth - plankGap,
    plankHeight,
    depth
  );

  for (let i = 0; i < plankCount; i += 1) {
    const toneShift = 0.08 * Math.sin(i * 1.37);
    const plankMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x7b5a3c).offsetHSL(0, 0, toneShift),
      roughness: 0.6,
      metalness: 0.08,
    });

    const plank = new THREE.Mesh(plankGeometry, plankMaterial);
    plank.position.x = -width / 2 + plankWidth * i + plankWidth / 2;
    plank.castShadow = true;
    plank.receiveShadow = true;

    plankGroup.add(plank);
  }

  parent.add(plankGroup);
}
