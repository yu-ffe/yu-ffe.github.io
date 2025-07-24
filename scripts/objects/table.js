import * as THREE from "three";

// 큐브형 테이블 생성 (상판 + 다리 4개)
export function createTable(scene) {
  const material = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });

  // 테이블 상판
  const topGeometry = new THREE.BoxGeometry(10, 1, 6);
  const top = new THREE.Mesh(topGeometry, material);
  top.position.set(0, -2, 0);
  scene.add(top);

  // 다리 생성 함수
  const createLeg = (x, z) => {
    const legGeometry = new THREE.BoxGeometry(1, 5, 1);
    const leg = new THREE.Mesh(legGeometry, material);
    leg.position.set(x, -4, z);
    scene.add(leg);
  };

  // 다리 4개 배치
  createLeg(-4.5, -2.5);
  createLeg(-4.5,  2.5);
  createLeg( 4.5, -2.5);
  createLeg( 4.5,  2.5);
}
