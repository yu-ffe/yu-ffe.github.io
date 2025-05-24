import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createFloor(scene, renderer) {
  const textureLoader = new THREE.TextureLoader();

  const colorTexture = textureLoader.load('../../image/Material/Wood/Wood067_1K-PNG_Color.png');
  const normalTexture = textureLoader.load('../../image/Material/Wood/Wood067_1K-PNG_NormalGL.png');
  const roughnessTexture = textureLoader.load('../../image/Material/Wood/Wood067_1K-PNG_Roughness.png');

  // 색공간 설정
  colorTexture.colorSpace = THREE.SRGBColorSpace;

  [colorTexture, normalTexture, roughnessTexture].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
  });

  // 바닥: 일반 박스 형태
  const groundGeometry = new THREE.BoxGeometry(20, 0.7, 20);

  const groundMaterial = new THREE.MeshStandardMaterial({
    map: colorTexture,
    normalMap: normalTexture,
    roughnessMap: roughnessTexture,
    roughness: 0.0,
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.position.y = -7.; // 두께가 1이므로 위로 0.5 이동해서 윗면이 y=0에 오도록 함
  scene.add(ground);

  if (renderer) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
}
