import { ThreeApp } from "./core/app.js";
import { setupLights } from "./lights/lights.js";
import { initializeWinterRoomScene } from "./scene/winterRoomScene.js";

const canvas = document.getElementById("webgl-canvas");
const app = new ThreeApp({ canvas });

initializeWinterRoomScene(app.scene);
setupLights(app.scene);

function init() {
  app.start();
}

init();
