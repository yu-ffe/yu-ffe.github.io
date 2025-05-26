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

  const wallMaterial = new THREE.MeshStandardMaterial({
    map: colorTexture,
    normalMap: normalTexture,
    roughnessMap: roughnessTexture,
    roughness: 1.0,
    side: THREE.DoubleSide,
  });

  // 왼쪽 벽 생성 (기존대로)
  const leftWallGeometry = new THREE.BoxGeometry(20, 14, 0.5);
  const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
  leftWall.position.set(-9.75, 5.35 - 5, 0);
  leftWall.rotation.y = Math.PI / 2;
  scene.add(leftWall);

  // === 뒤쪽 벽에 창문 구멍 생성 ===

  // 1. 벽 메쉬 생성 및 위치 지정
  const backWallGeometry = new THREE.BoxGeometry(20, 14, 0.5);
  const backWallMesh = new THREE.Mesh(backWallGeometry, wallMaterial);

  // 벽의 월드 위치 및 회전 설정 (CSG 연산 전에는 반드시 안 함)
  const wallPos = new THREE.Vector3(0, 5.35 - 5, -9.75);
  const wallRot = new THREE.Euler(0, 0, 0);

  // 2. 구멍용 박스 생성
  const windowHoleGeometry = new THREE.BoxGeometry(5, 5, 1);

  // 구멍용 메쉬 생성, 재질은 상관 없음 (CSG에서는 형상만 중요)
  const windowHoleMesh = new THREE.Mesh(windowHoleGeometry);

  // 3. 구멍 위치 조정 (벽 로컬 기준)
  // 예: 벽 중앙에서 왼쪽으로 5, 높이는 중앙 (0), 깊이는 0 (벽 두께 방향)
  windowHoleMesh.position.set(-4, 1, 0);
  windowHoleMesh.updateMatrix();

  backWallMesh.updateMatrix();

  const backWallCSG = CSG.fromMesh(backWallMesh);
  const holeCSG = CSG.fromMesh(windowHoleMesh);
  const subtractedCSG = backWallCSG.subtract(holeCSG);

  const backWallWithHole = CSG.toMesh(
    subtractedCSG,
    backWallMesh.matrix,
    wallMaterial
  );

  backWallWithHole.position.copy(wallPos);
  backWallWithHole.rotation.copy(wallRot);

  scene.add(backWallWithHole);

    // === 창문 +모양 프레임 추가 ===
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF, // 나무색
    metalness: 0.6,
    roughness: 0.3,
  });

  const frameDepth = 0.2; // 프레임 두께
  const frameWidth = 0.35; // 프레임 폭 (시각적으로 얇은 테두리)

  // 세로 프레임
  const verticalFrameGeo = new THREE.BoxGeometry(frameWidth, 6, frameDepth);
  const verticalFrame = new THREE.Mesh(verticalFrameGeo, frameMaterial);
  verticalFrame.position.set(-4, 1, -9.7); // Z 위치는 벽면 바로 앞
  scene.add(verticalFrame);

  // 가로 프레임
  const horizontalFrameGeo = new THREE.BoxGeometry(6, frameWidth, frameDepth);
  const horizontalFrame = new THREE.Mesh(horizontalFrameGeo, frameMaterial);
  horizontalFrame.position.set(-4, 1, -9.7);
  scene.add(horizontalFrame);

}
