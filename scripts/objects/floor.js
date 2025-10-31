import * as THREE from "three";
import { loadTextureSet } from "../utils/textureUtils.js";
import { FLOOR_TEXTURES } from "../config/assets.js";

export function createFloor(scene, textures = FLOOR_TEXTURES) {
  const { color, normal, roughness } = loadTextureSet({
    color: { ...textures.color, colorSpace: THREE.SRGBColorSpace },
    normal: textures.normal,
    roughness: textures.roughness,
  });

  const woodMaterial = new THREE.MeshStandardMaterial({
    map: color,
    normalMap: normal,
    roughnessMap: roughness,
    roughness: 0.0,
  });

  const brownMaterial = new THREE.MeshBasicMaterial({ color: 0x200f08 });

  const floorMaterials = [
    brownMaterial,
    brownMaterial,
    woodMaterial,
    brownMaterial,
    brownMaterial,
    brownMaterial,
  ];

  const groundGeometry = new THREE.BoxGeometry(20, 0.7, 20);
  const ground = new THREE.Mesh(groundGeometry, floorMaterials);
  ground.position.y = -7.0;
  ground.receiveShadow = true;
  scene.add(ground);

  const hazyBlackMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
  const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const entireBlackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

  const lowerMaterials = [
    hazyBlackMaterial,
    blackMaterial,
    entireBlackMaterial,
    blackMaterial,
    blackMaterial,
    blackMaterial,
  ];

  const lowerBlockGeometry = new THREE.BoxGeometry(20, 1.4, 20);
  const lowerBlock = new THREE.Mesh(lowerBlockGeometry, lowerMaterials);
  lowerBlock.position.y = ground.position.y - 2;
  lowerBlock.receiveShadow = true;
  scene.add(lowerBlock);
}
