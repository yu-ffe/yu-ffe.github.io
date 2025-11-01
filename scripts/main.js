import { ThreeApp } from "./core/app.js";
import { registerClickHandler } from "./events/clickEvents.js";
import { setupLights } from "./lights/lights.js";
import {
  buildArchitecture,
  createFloorPattern,
  addWindowWall,
  addFireplace,
  addFurniture,
  addSilhouettes,
  addDecor,
} from "./objects/cornerScene.js";

const canvas = document.getElementById("webgl-canvas");
const app = new ThreeApp({ canvas });
const { scene, camera } = app;

function init() {
  setupLights(scene);

  buildArchitecture(scene);
  createFloorPattern(scene);
  addWindowWall(scene);
  addFireplace(scene);
  addFurniture(scene);
  addSilhouettes(scene);
  addDecor(scene);

  registerClickHandler(camera, scene);

  app.start();
}

init();
