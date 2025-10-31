import * as THREE from "three";

export function createSurfaceFinishPanels(scene) {
  const wallGeometry = new THREE.PlaneGeometry(20, 0.5);
  const verticalGeometry = new THREE.PlaneGeometry(14, 0.5);

  const material = new THREE.MeshStandardMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });

  const panels = [
    { geometry: wallGeometry, rotation: [0, Math.PI / 2, 0], position: [10.001, -7, 0] },
    { geometry: wallGeometry, rotation: [0, Math.PI / 2, 0], position: [-10.001, -7, 0] },
    { geometry: verticalGeometry, rotation: [0, -Math.PI / 2, -Math.PI / 2], position: [10.001, 0.3, -9.701] },
    { geometry: verticalGeometry, rotation: [0, 0, -Math.PI / 2], position: [-9.701, 0.3, 10.001] },
    { geometry: wallGeometry, rotation: [Math.PI / 2, 0, 0], position: [0, 7.4, -9.7] },
    { geometry: wallGeometry, rotation: [0, 0, 0], position: [0, -5, 0] },
  ];

  panels.forEach(({ geometry, rotation, position }) => {
    const panel = new THREE.Mesh(geometry, material);
    panel.rotation.set(...rotation);
    panel.position.set(...position);
    scene.add(panel);
  });
}
