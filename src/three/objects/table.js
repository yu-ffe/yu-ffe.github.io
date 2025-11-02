import * as THREE from "three";

const TABLE_TOP = { size: [10, 1, 6], position: [0, -2, 0] };
const TABLE_LEGS = [
  { position: [-4.5, -4, -2.5] },
  { position: [-4.5, -4, 2.5] },
  { position: [4.5, -4, -2.5] },
  { position: [4.5, -4, 2.5] },
];

export function createTable(scene) {
  const material = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });

  const topGeometry = new THREE.BoxGeometry(...TABLE_TOP.size);
  const top = new THREE.Mesh(topGeometry, material);
  top.position.set(...TABLE_TOP.position);
  scene.add(top);

  const legGeometry = new THREE.BoxGeometry(1, 5, 1);

  TABLE_LEGS.forEach(({ position }) => {
    const leg = new THREE.Mesh(legGeometry, material);
    leg.position.set(...position);
    scene.add(leg);
  });
}
