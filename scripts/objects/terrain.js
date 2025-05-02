import * as THREE from "three";

export function createTerrain(scene) {
    const geometry = new THREE.PlaneGeometry(20, 20, 10, 10); // 10x10 그리드로 지형 생성
    const material = new THREE.MeshStandardMaterial({ color: 0x8B4513, wireframe: false });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2; // 땅처럼 보이게 회전
    scene.add(terrain);
}