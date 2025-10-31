import * as THREE from "three";

const DEFAULT_BLOCK_URL = "data/blocks.json";

export async function loadBlocks(scene, url = DEFAULT_BLOCK_URL) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch block data: ${response.status}`);
    }

    const blocks = await response.json();
    blocks.forEach((blockData) => {
      const { x, y, z, color } = blockData;
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({ color })
      );

      block.position.set(x, y, z);
      block.castShadow = true;
      block.receiveShadow = true;
      scene.add(block);
    });
  } catch (error) {
    console.error("[loadBlocks]", error);
  }
}
