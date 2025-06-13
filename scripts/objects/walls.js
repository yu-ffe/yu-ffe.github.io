import * as THREE from "three";
import { CSG } from "../libs/esm/CSG.js";

export function createWalls(scene) {
  const textureLoader = new THREE.TextureLoader();

  const colorTexture = textureLoader.load(
    "../../image/Material/Wallpaper/Wallpaper001A_1K-PNG_Color.png"
  );
  const normalTexture = textureLoader.load(
    "../../image/Material/Wallpaper/Wallpaper001A_1K-PNG_NormalGL.png"
  );
  const roughnessTexture = textureLoader.load(
    "../../image/Material/Wallpaper/Wallpaper001A_1K-PNG_Roughness.png"
  );

  colorTexture.colorSpace = THREE.SRGBColorSpace;

  [colorTexture, normalTexture, roughnessTexture].forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
  });

  const darkBrown = new THREE.Color(0x200f08); // 검정에 가까운 어두운 갈색

  const leftWallMaterials = [
    new THREE.MeshBasicMaterial({ color: darkBrown, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: darkBrown, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: darkBrown, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({
      map: colorTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
      roughness: 1.0,
      side: THREE.DoubleSide,
      color: new THREE.Color(0xaa8b66),
    }),
    new THREE.MeshStandardMaterial({
      map: colorTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
      roughness: 1.0,
      side: THREE.DoubleSide,
      color: new THREE.Color(0xaa8b66),
    }),
    new THREE.MeshStandardMaterial({
      map: colorTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
      roughness: 1.0,
      side: THREE.DoubleSide,
      color: new THREE.Color(0xaa8b66),
    }),
  ];

  const backWallMaterials = [
    new THREE.MeshBasicMaterial({ color: darkBrown, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ 
      map: colorTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
      roughness: 1.0,
      side: THREE.DoubleSide,
      color: 0xffffff }),
    new THREE.MeshBasicMaterial({ color: darkBrown, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({
      map: colorTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
      roughness: 1.0,
      side: THREE.DoubleSide,
      color: new THREE.Color(0xffffff),
    }),
    new THREE.MeshStandardMaterial({
      map: colorTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
      roughness: 1.0,
      side: THREE.DoubleSide,
      color: new THREE.Color(0xaa8b66),
    }),
    new THREE.MeshStandardMaterial({
      map: colorTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
      roughness: 1.0,
      side: THREE.DoubleSide,
      color: new THREE.Color(0xaa8b66),
    }),
  ];

  const leftWallGeometry = new THREE.BoxGeometry(20, 14, 0.5);
  const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterials);
  leftWall.position.set(-9.75, 5.35 - 5, 0);
  leftWall.rotation.y = Math.PI / 2;
  scene.add(leftWall);

  const backWallGeometry = new THREE.BoxGeometry(20, 14, 0.5);
  const backWallMesh = new THREE.Mesh(backWallGeometry, backWallMaterials);

  const wallPos = new THREE.Vector3(0, 5.35 - 5, -9.75);
  const wallRot = new THREE.Euler(0, 0, 0);

  const windowHoleGeometry = new THREE.BoxGeometry(5, 5, 1);
  const windowHoleMesh = new THREE.Mesh(windowHoleGeometry);

  windowHoleMesh.position.set(-4, 1, 0);
  windowHoleMesh.updateMatrix();
  backWallMesh.updateMatrix();

  const backWallCSG = CSG.fromMesh(backWallMesh);
  const holeCSG = CSG.fromMesh(windowHoleMesh);
  const subtractedCSG = backWallCSG.subtract(holeCSG);

  const backWallWithHole = CSG.toMesh(
    subtractedCSG,
    backWallMesh.matrix,
    backWallMaterials
  );

  backWallWithHole.position.copy(wallPos);
  backWallWithHole.rotation.copy(wallRot);
  scene.add(backWallWithHole);

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.6,
    roughness: 0.3,
  });

  const frameDepth = 0.2;
  const frameWidth = 0.35;

  const verticalFrameGeo = new THREE.BoxGeometry(frameWidth, 6, frameDepth);
  const verticalFrame = new THREE.Mesh(verticalFrameGeo, frameMaterial);
  verticalFrame.position.set(-4, 1, -9.7);
  scene.add(verticalFrame);

  const horizontalFrameGeo = new THREE.BoxGeometry(6, frameWidth, frameDepth);
  const horizontalFrame = new THREE.Mesh(horizontalFrameGeo, frameMaterial);
  horizontalFrame.position.set(-4, 1.4, -9.7);
  scene.add(horizontalFrame);
}
