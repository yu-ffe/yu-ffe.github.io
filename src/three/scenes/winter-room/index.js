import * as THREE from "three";
import { FOG_COLOR, FOG_FAR, FOG_NEAR } from "../../constants/environment.js";
import { addFoundation } from "./components/foundation.js";
import { addFloor } from "./components/floor.js";
import { addWalls } from "./components/walls.js";
import { addCeilingCove } from "./components/ceilingCove.js";
import { addWindow } from "./components/window.js";
import { addEscapeStairs } from "./components/stairs.js";
import { addDecor } from "./components/decor.js";

export function initializeWinterRoomScene(scene) {
  const roomGroup = new THREE.Group();
  roomGroup.name = "WinterRoom";

  addFoundation(roomGroup);
  addFloor(roomGroup);
  const { stairsConfig } = addWalls(roomGroup);
  addCeilingCove(roomGroup);
  addWindow(roomGroup);
  addEscapeStairs(roomGroup, stairsConfig);
  addDecor(roomGroup);

  scene.add(roomGroup);
  scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);
}
