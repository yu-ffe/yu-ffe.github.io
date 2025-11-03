// Stream_LiveGame :: 블록 메시 생성을 위해 Three.js를 사용한다.
import * as THREE from "three";

export async function loadBlocks(scene) {
  try {
    // Stream_LiveGame :: 서버에서 블록 정의를 가져온다.
    const response = await fetch("/data/blocks.json");
    if (!response.ok) {
      throw new Error(`Unexpected ${response.status} response when fetching block data.`);
    }

    // Stream_LiveGame :: 블록 좌표와 색상을 해석한다.
    const blocks = await response.json();

    blocks.forEach(({ x, y, z, color }) => {
      // Stream_LiveGame :: 동일한 크기의 큐브 지오메트리를 생성한다.
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({ color })
      );
      block.position.set(x, y, z);
      scene.add(block);
    });
  } catch (error) {
    // Stream_LiveGame :: 로딩 실패 시 오류를 노출한다.
    console.error("Failed to load block data:", error);
  }
}
