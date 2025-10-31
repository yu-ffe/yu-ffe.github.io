import * as THREE from "three";

export async function loadBlocks(scene) {
  try {
    const response = await fetch("./data/blocks.json");
    const blocks = await response.json();

    blocks.forEach(({ x, y, z, color }) => {
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({ color })
      );
      block.position.set(x, y, z);
      scene.add(block);
    });
  } catch (error) {
    console.error("Failed to load block data:", error);
  }
}
