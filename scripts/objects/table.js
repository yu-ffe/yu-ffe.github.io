import * as THREE from "three";

export function createTable(scene) {
  const material = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });

  const top = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 6), material);
  top.position.set(0, -2, 0);
  top.castShadow = true;
  top.receiveShadow = true;
  scene.add(top);

  const legGeometry = new THREE.BoxGeometry(1, 5, 1);

  [
    [-4.5, -2.5],
    [-4.5, 2.5],
    [4.5, -2.5],
    [4.5, 2.5],
  ].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeometry, material);
    leg.position.set(x, -4, z);
    leg.castShadow = true;
    leg.receiveShadow = true;
    scene.add(leg);
  });
}
