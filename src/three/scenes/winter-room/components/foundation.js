// Stream_LiveGame :: 기초 메시 생성을 위해 Three.js 모듈을 사용한다.
import * as THREE from "three";
import { BASE_OFFSET, FLOOR_THICKNESS, ROOM_SIZE } from "../constants.js";

function createRoundedFoundationGeometry(width, depth, height) {
  const cornerRadius = Math.min(width, depth) * 0.12;
  const shape = new THREE.Shape();

  const x = -width / 2;
  const y = -depth / 2;

  shape.moveTo(x + cornerRadius, y);
  shape.lineTo(x + width - cornerRadius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
  shape.lineTo(x + width, y + depth - cornerRadius);
  shape.quadraticCurveTo(x + width, y + depth, x + width - cornerRadius, y + depth);
  shape.lineTo(x + cornerRadius, y + depth);
  shape.quadraticCurveTo(x, y + depth, x, y + depth - cornerRadius);
  shape.lineTo(x, y + cornerRadius);
  shape.quadraticCurveTo(x, y, x + cornerRadius, y);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
  });

  geometry.center();
  geometry.rotateX(-Math.PI / 2);

  return geometry;
}

export function addFoundation(parent) {
  const { width, depth, floorLevel } = ROOM_SIZE;
  const foundationHeight = 1.6;

  const foundationWidth = width + BASE_OFFSET;
  const foundationDepth = depth + BASE_OFFSET;

  const foundationGeometry = createRoundedFoundationGeometry(
    foundationWidth,
    foundationDepth,
    foundationHeight
  );

  // Stream_LiveGame :: 방보다 조금 넓은 기초 블록을 생성한다.
  const foundation = new THREE.Mesh(
    foundationGeometry,
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
