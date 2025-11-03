// Stream_LiveGame :: 씬 구성에 필요한 Three.js 유틸리티.
import * as THREE from "three";
// Stream_LiveGame :: 안개 연출을 위한 상수들을 불러온다.
import { FOG_COLOR, FOG_FAR, FOG_NEAR } from "../../constants/environment.js";
// Stream_LiveGame :: 겨울 방을 구성하는 하위 컴포넌트 모듈들.
import { addFoundation } from "./components/foundation.js";
import { addFloor } from "./components/floor.js";
import { addWalls } from "./components/walls.js";
import { addCeilingCove } from "./components/ceilingCove.js";
import { addWindow } from "./components/window.js";
import { addEscapeStairs } from "./components/stairs.js";
import { addDecor } from "./components/decor.js";

export function initializeWinterRoomScene(scene) {
  // Stream_LiveGame :: 방 전체를 하나의 그룹으로 묶어 관리한다.
  const roomGroup = new THREE.Group();
  roomGroup.name = "WinterRoom";

  // Stream_LiveGame :: 순서대로 구조물을 배치하여 공간을 채운다.
  addFoundation(roomGroup);
  addFloor(roomGroup);
  const { stairsConfig } = addWalls(roomGroup);
  // addCeilingCove(roomGroup);
  addWindow(roomGroup);
  addEscapeStairs(roomGroup, stairsConfig);
  addDecor(roomGroup);

  // Stream_LiveGame :: 완성된 그룹을 씬에 추가하고 안개를 적용한다.
  scene.add(roomGroup);
  scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);
}
