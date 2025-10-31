import { createScene } from "./core/scene.js";
import { createRenderer } from "./core/renderer.js";
import {
  createOrthographicCamera,
  configureResponsiveCamera,
} from "./core/camera.js";
import { startRenderLoop } from "./core/animationLoop.js";
import { registerClickHandler } from "./events/clickEvents.js";
import { createFloor } from "./objects/floor.js";
import { createWalls } from "./objects/walls.js";
import { createTable } from "./objects/table.js";
import { createBillboards } from "./objects/billboard.js";
import { setupLights } from "./lights/lights.js";
import { loadBlocks } from "./objects/blockManager.js";
import { loadTexts } from "./objects/textManager.js";
import { BILLBOARD_IMAGES } from "./config/assets.js";

const canvas = document.getElementById("webgl-canvas");
if (!canvas) {
  throw new Error("Canvas element with id 'webgl-canvas' was not found.");
}

const scene = createScene();

const frustumSize = 30;
const aspect = window.innerWidth / window.innerHeight;
const camera = createOrthographicCamera({ frustumSize, aspect });
const renderer = createRenderer(canvas);

setupLights(scene);
createFloor(scene);
createWalls(scene);
createTable(scene);
createBillboards(scene, BILLBOARD_IMAGES);

registerClickHandler({ camera, scene });
loadBlocks(scene);
loadTexts(scene, camera);

configureResponsiveCamera({ camera, renderer, frustumSize });
startRenderLoop({ renderer, scene, camera });
