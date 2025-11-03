// Stream_LiveGame :: 기초 메시 생성을 위해 Three.js 모듈을 사용한다.
import * as THREE from "three";
import { BASE_OFFSET, FLOOR_THICKNESS, ROOM_SIZE } from "../constants.js";

export function addFoundation(parent) {
  const { width, depth, floorLevel } = ROOM_SIZE;
  const foundationHeight = 1.6;

  // Stream_LiveGame :: 방보다 조금 넓은 기초 블록을 생성한다.
  const foundation = new THREE.Mesh(
    new THREE.BoxGeometry(width + BASE_OFFSET, foundationHeight, depth + BASE_OFFSET),
    new THREE.MeshStandardMaterial({
      color: 0x567a92,
      roughness: 0.95,
      metalness: 0.05,
    })
  );
  foundation.position.y = floorLevel - FLOOR_THICKNESS - foundationHeight / 2;
  foundation.receiveShadow = true;
  // Stream_LiveGame :: 기초를 상위 그룹에 추가한다.
  parent.add(foundation);
}
