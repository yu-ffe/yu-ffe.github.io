import * as THREE from "three";
import { CSG } from "../libs/esm/CSG.js";
import { loadTextureSet } from "../utils/textureUtils.js";
import { WALL_TEXTURES } from "../config/assets.js";

export function createWalls(scene, textures = WALL_TEXTURES) {
  const textureSet = loadTextureSet(textures);

  const createWallpaperMaterial = (baseColor) =>
    new THREE.MeshStandardMaterial({
      map: textureSet.color,
      normalMap: textureSet.normal,
      roughnessMap: textureSet.roughness,
      roughness: 1.0,
      side: THREE.DoubleSide,
      color: baseColor,
    });

  const solidMaterial = (color) =>
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });

  const darkBrown = new THREE.Color(0x200f08);
  const accentBrown = new THREE.Color(0xaa8b66);
  const neutralWhite = new THREE.Color(0xffffff);

  const leftWallMaterials = [
    solidMaterial(darkBrown),
    solidMaterial(darkBrown),
    solidMaterial(darkBrown),
    createWallpaperMaterial(accentBrown),
    createWallpaperMaterial(accentBrown),
    createWallpaperMaterial(accentBrown),
  ];

  const backWallMaterials = [
    solidMaterial(darkBrown),
    createWallpaperMaterial(neutralWhite),
    solidMaterial(darkBrown),
    createWallpaperMaterial(neutralWhite),
    createWallpaperMaterial(accentBrown),
    createWallpaperMaterial(accentBrown),
  ];

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(20, 14, 0.5),
    leftWallMaterials
  );
  leftWall.position.set(-9.75, 0.35, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(20, 14, 0.5),
    backWallMaterials
  );
  backWall.position.set(0, 0.35, -9.75);
  backWall.receiveShadow = true;
  backWall.updateMatrix();

  const wallWithWindow = carveWindow(backWall);
  wallWithWindow.receiveShadow = true;
  scene.add(wallWithWindow);

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: neutralWhite,
    metalness: 0.6,
    roughness: 0.3,
  });

  buildWindowFrame(scene, frameMaterial);
}

function carveWindow(wallMesh) {
  const wallCSG = CSG.fromMesh(wallMesh);

  const windowHole = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 1));
  windowHole.position.set(-4, 1, 0);
  windowHole.updateMatrix();

  const result = wallCSG.subtract(CSG.fromMesh(windowHole));
  const mesh = CSG.toMesh(result, wallMesh.matrix, wallMesh.material);
  mesh.position.copy(wallMesh.position);
  mesh.rotation.copy(wallMesh.rotation);
  return mesh;
}

function buildWindowFrame(scene, material) {
  const frameDepth = 0.2;
  const frameWidth = 0.35;

  const verticalFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameWidth, 6, frameDepth),
    material
  );
  verticalFrame.position.set(-4, 1, -9.7);
  scene.add(verticalFrame);

  const horizontalFrame = new THREE.Mesh(
    new THREE.BoxGeometry(6, frameWidth, frameDepth),
    material
  );
  horizontalFrame.position.set(-4, 1.4, -9.7);
  scene.add(horizontalFrame);
}
