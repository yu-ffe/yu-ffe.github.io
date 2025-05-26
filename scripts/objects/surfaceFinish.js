import * as THREE from 'three';

export function createSurfaceFinishCubes(scene) {
  const geometry = new THREE.PlaneGeometry(20, 0.5);
  const geometry_height = new THREE.PlaneGeometry(14, 0.5);

  const material = new THREE.MeshStandardMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });

  // 1. 오른쪽 벽 (YZ 평면)
  const plane1 = new THREE.Mesh(geometry, material);
  plane1.rotation.y = Math.PI / 2;
  plane1.position.set(10.001, -7, 0);
  scene.add(plane1);

  // 2. 왼쪽 벽 (YZ 평면)
  const plane2 = new THREE.Mesh(geometry, material);
  plane2.rotation.y = Math.PI / 2;
  plane2.position.set(-10.001, -7, 0);
  scene.add(plane2);

  // 3. 앞쪽 벽 (XZ 평면)
  const plane3 = new THREE.Mesh(geometry_height, material);
  plane3.rotation.y = -Math.PI / 2;
  plane3.rotation.z = -Math.PI / 2;
  plane3.position.set(10.001, .3,-9.701);
  scene.add(plane3);

  // 4. 뒷쪽 벽 (XZ 평면)
  const plane4 = new THREE.Mesh(geometry_height, material);
  plane4.rotation.z = -Math.PI / 2;
  plane4.position.set(-9.701, .3, 10.001);
  scene.add(plane4);

  // 5. 바닥 (XY 평면)
  const plane5 = new THREE.Mesh(geometry, material);
  plane5.rotation.x = Math.PI / 2;
  plane5.position.set(0,7.4, -9.7); // 살짝 아래로
  scene.add(plane5);

  // 6. 천장 (XY 평면)
  const plane6 = new THREE.Mesh(geometry, material);
  plane6.rotation.x = 0;
  plane6.position.set(0, -5, 0); // 살짝 위로
  scene.add(plane6);
}
