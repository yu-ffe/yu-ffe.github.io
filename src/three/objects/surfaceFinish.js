import * as THREE from "three";

const SURFACE_PLANES = [
  { rotation: [0, Math.PI / 2, 0], position: [10.001, -7, 0], size: [20, 0.5] },
  { rotation: [0, Math.PI / 2, 0], position: [-10.001, -7, 0], size: [20, 0.5] },
  { rotation: [0, -Math.PI / 2, -Math.PI / 2], position: [10.001, 0.3, -9.701], size: [14, 0.5] },
  { rotation: [0, 0, -Math.PI / 2], position: [-9.701, 0.3, 10.001], size: [14, 0.5] },
  { rotation: [Math.PI / 2, 0, 0], position: [0, 7.4, -9.7], size: [20, 0.5] },
  { rotation: [0, 0, 0], position: [0, -5, 0], size: [20, 0.5] },
];

export function createSurfaceFinishCubes(scene) {
  const material = new THREE.MeshStandardMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });

  SURFACE_PLANES.forEach(({ rotation, position, size }) => {
    const geometry = new THREE.PlaneGeometry(size[0], size[1]);
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.set(...rotation);
    plane.position.set(...position);
    scene.add(plane);
  });
}
