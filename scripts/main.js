import { ThreeApp } from "./core/app.js";
import { registerClickHandler } from "./events/clickEvents.js";
import { setupLights } from "./lights/lights.js";
import {
  createCornerShell,
  createCarpet,
  createPictureFrames,
  createBookshelf,
  createFloatingShelves,
  createAccentTable,
  createChandelier,
} from "./objects/cornerScene.js";
import { loadFurnitureModels } from "./objects/furnitureLoader.js";

const canvas = document.getElementById("webgl-canvas");
const app = new ThreeApp({ canvas });
const { scene, camera } = app;

async function init() {
  setupLights(scene);

  createCornerShell(scene);
  createCarpet(scene);
  createPictureFrames(scene);
  createBookshelf(scene);
  createFloatingShelves(scene);
  createAccentTable(scene);
  createChandelier(scene);

  registerClickHandler(camera, scene);

  try {
    await loadFurnitureModels(scene);
  } catch (error) {
    console.error("Failed to load remote furniture assets:", error);
  }

  app.start();
}

init();
