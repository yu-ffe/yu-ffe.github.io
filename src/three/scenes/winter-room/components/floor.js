import * as THREE from "three";
import { FLOOR_THICKNESS, ROOM_SIZE } from "../constants.js";

export function addFloor(parent) {
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
