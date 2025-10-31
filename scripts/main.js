import { ThreeApp } from "./core/app.js";
import { registerClickHandler } from "./events/clickEvents.js";
import { createFloor } from "./objects/floor.js";
import { createWalls } from "./objects/walls.js";
import { createSurfaceFinishCubes } from "./objects/surfaceFinish.js";
import { loadBlocks } from "./objects/blockManager.js";
import { loadTexts } from "./objects/textManager.js";
import { createTable } from "./objects/table.js";
import { addImagePlanes } from "./objects/imagePlanes.js";
import { setupLights } from "./lights/lights.js";

const canvas = document.getElementById("webgl-canvas");
const app = new ThreeApp({ canvas });
const { scene, camera } = app;

setupLights(scene);
createFloor(scene);
createWalls(scene);
createSurfaceFinishCubes(scene);
createTable(scene);
addImagePlanes(scene);

registerClickHandler(camera, scene);

// Promise.all([loadBlocks(scene), loadTexts(scene, camera)]).catch((error) => {
//   console.error("Asset loading failed:", error);
// });

app.start();
