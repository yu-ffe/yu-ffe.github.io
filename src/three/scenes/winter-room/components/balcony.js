// Stream_LiveGame :: 발코니 구조 생성을 위해 Three.js 도구를 사용한다.
import * as THREE from "three";
import { ROOM_SIZE, WALL_THICKNESS, FLOOR_THICKNESS } from "../constants.js";

export function addBalcony(parent, opening = {}) {
  const { width, floorLevel, depth } = ROOM_SIZE;

  // Stream_LiveGame :: 창문 폭을 기준으로 발코니 폭을 계산하고 약간의 여유를 둔다.
  const openingWidth = opening.width ?? depth / 3;
  const centerZ = opening.centerZ ?? 0;

  const deckDepth = 5.2;
  const deckWidth = Math.max(openingWidth + 4.5, 11);
  const deckThickness = 0.55;

  // Stream_LiveGame :: 왼쪽 외벽의 바깥 면 좌표를 구한다.
  const outerWallX = -width / 2 - WALL_THICKNESS / 2;

  const balconyGroup = new THREE.Group();
  balconyGroup.name = "Balcony";

  const deckMaterial = new THREE.MeshStandardMaterial({
    color: 0x6e7c8f,
    roughness: 0.74,
    metalness: 0.28,
  });

  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(deckDepth, deckThickness, deckWidth),
    deckMaterial
  );
  deck.position.set(
    outerWallX - deckDepth / 2 + 0.08,
    floorLevel - deckThickness / 2 - 0.08,
    centerZ
  );
  deck.castShadow = true;
  deck.receiveShadow = true;
  balconyGroup.add(deck);

  // Stream_LiveGame :: 발코니의 난간을 구성한다.
  const railHeight = 3.4;
  const railThickness = 0.22;
  const railInset = 0.45;

  const railMaterial = new THREE.MeshStandardMaterial({
    color: 0xdbe6f6,
    roughness: 0.42,
    metalness: 0.36,
    emissive: new THREE.Color(0x193047).multiplyScalar(0.05),
  });

  const createRail = (geometry, position) => {
    const rail = new THREE.Mesh(geometry, railMaterial);
    rail.position.copy(position);
    rail.castShadow = true;
    rail.receiveShadow = true;
    balconyGroup.add(rail);
    return rail;
  };

  const deckOuterEdgeX = deck.position.x - deckDepth / 2;
  const deckFrontEdgeZ = deck.position.z + deckWidth / 2;
  const deckBackEdgeZ = deck.position.z - deckWidth / 2;

  // Stream_LiveGame :: 창문 바로 앞은 비워 두고 세 면만 난간을 설치한다.
  createRail(
    new THREE.BoxGeometry(railThickness, railHeight, deckWidth - railInset * 2),
    new THREE.Vector3(
      deckOuterEdgeX + railThickness / 2,
      floorLevel + railHeight / 2,
      deck.position.z
    )
  );

  createRail(
    new THREE.BoxGeometry(deckDepth - railInset, railHeight, railThickness),
    new THREE.Vector3(
      deck.position.x,
      floorLevel + railHeight / 2,
      deckFrontEdgeZ - railThickness / 2
    )
  );

  createRail(
    new THREE.BoxGeometry(deckDepth - railInset, railHeight, railThickness),
    new THREE.Vector3(
      deck.position.x,
      floorLevel + railHeight / 2,
      deckBackEdgeZ + railThickness / 2
    )
  );

  // Stream_LiveGame :: 난간 보강용 세로 기둥을 간격을 두고 추가한다.
  const postCount = 3;
  const postSpacing = (deckWidth - railInset * 2) / (postCount + 1);
  const postGeometry = new THREE.BoxGeometry(railThickness * 0.92, railHeight, railThickness * 0.92);

  for (let i = 1; i <= postCount; i += 1) {
    const offsetZ = -deckWidth / 2 + railInset + postSpacing * i;
    createRail(
      postGeometry,
      new THREE.Vector3(
        deckOuterEdgeX + railThickness / 2,
        floorLevel + railHeight / 2,
        deck.position.z + offsetZ
      )
    );
  }

  // Stream_LiveGame :: 바닥 아래쪽 지지대를 추가하여 구조감을 준다.
  const supportMaterial = new THREE.MeshStandardMaterial({
    color: 0x4f596a,
    roughness: 0.68,
    metalness: 0.18,
  });

  const supportGeometry = new THREE.BoxGeometry(0.6, FLOOR_THICKNESS * 3.2, 0.6);
  const supportCount = 3;
  const supportSpacing = (deckWidth - railInset * 2) / (supportCount - 1);
  const supportBottomY =
    floorLevel - deckThickness / 2 - FLOOR_THICKNESS * 3.2 / 2 - 1.6;

  for (let i = 0; i < supportCount; i += 1) {
    const support = new THREE.Mesh(supportGeometry, supportMaterial);
    support.position.set(
      deckOuterEdgeX + deckDepth * 0.15,
      supportBottomY,
      deck.position.z - deckWidth / 2 + railInset + supportSpacing * i
    );
    support.castShadow = true;
    support.receiveShadow = true;
    balconyGroup.add(support);
  }

  parent.add(balconyGroup);

  return { group: balconyGroup };
}
