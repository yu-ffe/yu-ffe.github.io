import * as THREE from "three";
import { ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

export function addCeilingCove(parent) {
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
