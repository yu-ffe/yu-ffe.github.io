import * as THREE from "three";
import { BASE_OFFSET, FLOOR_THICKNESS, ROOM_SIZE } from "../constants.js";

export function addFoundation(parent) {
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
