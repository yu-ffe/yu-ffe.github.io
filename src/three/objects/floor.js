import * as THREE from "three";

const WOOD_TEXTURES = {
  map: "../../image/Material/Wood/Wood067_1K-PNG_Color.png",
  normalMap: "../../image/Material/Wood/Wood067_1K-PNG_NormalGL.png",
  roughnessMap: "../../image/Material/Wood/Wood067_1K-PNG_Roughness.png",
};

const FLOOR_SIZE = { width: 20, height: 0.7, depth: 20 };
const LOWER_BLOCK_OFFSET = 2;

export function createFloor(scene) {
  const textureLoader = new THREE.TextureLoader();
  const textures = Object.entries(WOOD_TEXTURES).reduce((acc, [key, path]) => {
    const texture = textureLoader.load(path);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.center.set(0.5, 0.5);
    texture.rotation = Math.PI / 2;
    if (key === "map") {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    acc[key] = texture;
    return acc;
  }, {});

  const woodMaterial = new THREE.MeshStandardMaterial({
    map: textures.map,
    normalMap: textures.normalMap,
    roughnessMap: textures.roughnessMap,
    roughness: 0.2,
  });

  const accentMaterial = new THREE.MeshBasicMaterial({ color: 0x200f08 });

  const floorMaterials = [
    accentMaterial,
    accentMaterial,
    woodMaterial,
    accentMaterial,
    accentMaterial,
    accentMaterial,
  ];

  const groundGeometry = new THREE.BoxGeometry(
    FLOOR_SIZE.width,
    FLOOR_SIZE.height,
    FLOOR_SIZE.depth
  );
  const ground = new THREE.Mesh(groundGeometry, floorMaterials);
  ground.position.y = -7.0;
  scene.add(ground);

  const lowerMaterials = Array(6).fill(new THREE.MeshBasicMaterial({ color: 0x111111 }));
  const lowerBlockGeometry = new THREE.BoxGeometry(
    FLOOR_SIZE.width,
    FLOOR_SIZE.height * 2,
    FLOOR_SIZE.depth
  );
  const lowerBlock = new THREE.Mesh(lowerBlockGeometry, lowerMaterials);
  lowerBlock.position.y = ground.position.y - LOWER_BLOCK_OFFSET;
  scene.add(lowerBlock);
}
