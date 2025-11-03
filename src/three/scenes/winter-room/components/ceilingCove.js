// Stream_LiveGame :: 천장 코브 조명 구조를 만들기 위한 Three.js 모듈.
import * as THREE from "three";
import { ROOM_SIZE, WALL_THICKNESS } from "../constants.js";

export function addCeilingCove(parent) {
  const { width, depth, height, floorLevel } = ROOM_SIZE;
  const coveHeight = 0.9;

  // Stream_LiveGame :: 코브 조명 구조에 사용할 따뜻한 재질.
  const coveMaterial = new THREE.MeshStandardMaterial({
    color: 0xcfe2f7,
    roughness: 0.55,
    metalness: 0.2,
    emissive: new THREE.Color(0x7cc6ff).multiplyScalar(0.2),
  });

  const inset = WALL_THICKNESS + 0.18;

  // Stream_LiveGame :: 좌측 벽을 따라 길게 이어지는 코브 생성.
  const leftCove = new THREE.Mesh(
    new THREE.BoxGeometry(WALL_THICKNESS, coveHeight, depth - inset),
    coveMaterial
  );
  leftCove.position.set(
    -width / 2 + WALL_THICKNESS / 2,
    floorLevel + height - coveHeight / 2,
    inset / 2
  );
  leftCove.castShadow = true;
  leftCove.receiveShadow = true;
  parent.add(leftCove);

  // Stream_LiveGame :: 후면 벽 상단의 코브를 추가한다.
  const backCove = new THREE.Mesh(
    new THREE.BoxGeometry(width - inset, coveHeight, WALL_THICKNESS),
    coveMaterial
  );
  backCove.position.set(
    inset / 2,
    floorLevel + height - coveHeight / 2,
    -depth / 2 + WALL_THICKNESS / 2
  );
  backCove.castShadow = true;
  backCove.receiveShadow = true;
  parent.add(backCove);

  // Stream_LiveGame :: 두 코브가 만나는 코너 부분을 실린더 지오메트리로 마감한다.
  const cornerCap = new THREE.Mesh(
    new THREE.CylinderGeometry(
      WALL_THICKNESS,
      WALL_THICKNESS,
      coveHeight,
      24,
      1,
      true,
      0,
      Math.PI / 2
    ),
    coveMaterial
  );
  cornerCap.rotation.y = Math.PI / 2;
  cornerCap.position.set(
    -width / 2 + WALL_THICKNESS,
    floorLevel + height - coveHeight / 2,
    -depth / 2 + WALL_THICKNESS
  );
  cornerCap.castShadow = true;
  cornerCap.receiveShadow = true;
  parent.add(cornerCap);
}
