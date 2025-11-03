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

  const inset = WALL_THICKNESS + 0.18;

  const leftCove = new THREE.Mesh(
    new THREE.BoxGeometry(WALL_THICKNESS, coveHeight, depth - inset),
    coveMaterial
  );
  leftCove.position.set(
    -width / 2 + WALL_THICKNESS / 2,
    floorLevel + height - coveHeight / 2,
    inset / 2
  );
  leftCove.castShadow = true;
  leftCove.receiveShadow = true;
  parent.add(leftCove);

  const backCove = new THREE.Mesh(
    new THREE.BoxGeometry(width - inset, coveHeight, WALL_THICKNESS),
    coveMaterial
  );
  backCove.position.set(
    inset / 2,
    floorLevel + height - coveHeight / 2,
    -depth / 2 + WALL_THICKNESS / 2
  );
  backCove.castShadow = true;
  backCove.receiveShadow = true;
  parent.add(backCove);

  const cornerCap = new THREE.Mesh(
    new THREE.CylinderGeometry(
      WALL_THICKNESS,
      WALL_THICKNESS,
      coveHeight,
      24,
      1,
      true,
      0,
      Math.PI / 2
    ),
    coveMaterial
  );
  cornerCap.rotation.y = Math.PI / 2;
  cornerCap.position.set(
    -width / 2 + WALL_THICKNESS,
    floorLevel + height - coveHeight / 2,
    -depth / 2 + WALL_THICKNESS
  );
  cornerCap.castShadow = true;
  cornerCap.receiveShadow = true;
  parent.add(cornerCap);
}
