import * as THREE from "three";

// JSON 데이터를 불러와 블럭 생성
export function loadBlocks(scene) {
    fetch("./data/blocks.json")
        .then(response => response.json())
        .then(blocks => {
            blocks.forEach(blockData => {
                const { x, y, z, color } = blockData;

                const geometry = new THREE.BoxGeometry(2, 2, 2);
                const material = new THREE.MeshStandardMaterial({ color });

                const block = new THREE.Mesh(geometry, material);
                block.position.set(x, y, z);

                scene.add(block);
            });
        })
        .catch(error => console.error("블록 데이터를 불러오는 중 오류 발생:", error));
}