import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createFloor(scene, renderer) {
  const textureLoader = new THREE.TextureLoader();

  const colorTexture = textureLoader.load('../../image/Material/Wood/Wood067_1K-PNG_Color.png');
  const normalTexture = textureLoader.load('../../image/Material/Wood/Wood067_1K-PNG_NormalGL.png');
  const roughnessTexture = textureLoader.load('../../image/Material/Wood/Wood067_1K-PNG_Roughness.png');

  colorTexture.colorSpace = THREE.SRGBColorSpace;

  [colorTexture, normalTexture, roughnessTexture].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.center.set(0.5, 0.5);
    tex.rotation = Math.PI / 2;
  });

  const woodMaterial = new THREE.MeshStandardMaterial({
    map: colorTexture,
    normalMap: normalTexture,
    roughnessMap: roughnessTexture,
    roughness: 0.0,
  });

  const brownMaterial = new THREE.MeshBasicMaterial({
    color: 0x200f08, 
  });

  const floorMaterials = [
    brownMaterial, // right
    brownMaterial, // left
    woodMaterial,  // top (위쪽면)
    brownMaterial, // bottom
    brownMaterial, // front
    brownMaterial  // back
  ];

  const groundGeometry = new THREE.BoxGeometry(20, 0.7, 20);
  const ground = new THREE.Mesh(groundGeometry, floorMaterials);
  ground.position.y = -7.0;
  scene.add(ground);
  
  const hazyBlackMaterial = new THREE.MeshBasicMaterial({
    color: 0x222222, // 어두운 회색
  });

  const blackMaterial = new THREE.MeshBasicMaterial({
    color: 0x111111, // 검정
  });

    const entireBlackMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000, // 검정
  });

  const lowerMaterials = [
    hazyBlackMaterial, // right
    blackMaterial, // left
    entireBlackMaterial, // top (위쪽면)
    blackMaterial,  // bottom
    blackMaterial, // front
    blackMaterial  // back
  ];

  const lowerBlockGeometry = new THREE.BoxGeometry(20, 0.7 * 2, 20);
  const lowerBlock = new THREE.Mesh(lowerBlockGeometry, lowerMaterials);
  lowerBlock.position.y = ground.position.y - 2; // 아래로 붙이기
  scene.add(lowerBlock);

  if (renderer) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
}
