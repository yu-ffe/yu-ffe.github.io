import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { ROOM_DIMENSIONS } from "./cornerScene.js";

const CHAIR_URL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Chair/glTF-Binary/Chair.glb";

export async function loadFurnitureModels(scene) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(CHAIR_URL);

  const chairScene = gltf.scene;
  chairScene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const bbox = new THREE.Box3().setFromObject(chairScene);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const targetHeight = 3.8;
  const uniformScale = targetHeight / size.y;
  chairScene.scale.setScalar(uniformScale);

  bbox.setFromObject(chairScene);
  const minY = bbox.min.y;
  chairScene.position.y -= minY;

  const chairRoot = new THREE.Group();
  chairRoot.add(chairScene);

  const placements = [
    {
      position: new THREE.Vector3(-3.2, 0, -1.4),
      rotation: Math.PI / 5,
      color: 0xff6f91,
    },
    {
      position: new THREE.Vector3(1.9, 0, -0.6),
      rotation: -Math.PI / 1.9,
      color: 0xff5d79,
    },
    {
      position: new THREE.Vector3(-1.2, 0, 2.6),
      rotation: Math.PI / 2.4,
      color: 0xff8a9c,
    },
  ];

  placements.forEach(({ position, rotation, color }) => {
    const chair = chairRoot.clone(true);
    styleChairMaterials(chair, color);
    chair.position.copy(position);
    chair.position.y = ROOM_DIMENSIONS.floorY + 0.02;
    chair.rotation.y = rotation;
    scene.add(chair);
  });
}

function styleChairMaterials(root, color) {
  root.traverse((child) => {
    if (child.isMesh) {
      const material = child.material.clone();
      material.color = new THREE.Color(color);
      material.roughness = 0.45;
      material.metalness = 0.1;
      child.material = material;
    }
  });
}

