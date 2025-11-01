import * as THREE from "three";
import { ThreeApp } from "./core/app.js";
import { setupLights } from "./lights/lights.js";
import {
  ROOM_DIMENSIONS,
  createAccentTable,
  createBookshelf,
  createCarpet,
  createCeilingCove,
  createChandelier,
  createCornerShell,
  createFeatureDivider,
  createFloatingShelves,
  createPictureFrames,
  createWindowBench,
} from "./objects/cornerScene.js";
import { loadFurnitureModels } from "./objects/furnitureLoader.js";
import { registerClickHandler } from "./events/clickEvents.js";

const canvas = document.getElementById("webgl-canvas");
const app = new ThreeApp({ canvas });

const cameraRig = new THREE.Group();
app.scene.add(cameraRig);
cameraRig.add(app.camera);

app.camera.position.set(22, 12, 0);
app.camera.lookAt(new THREE.Vector3(-1.5, ROOM_DIMENSIONS.floorY + 2.2, -2));
app.camera.updateProjectionMatrix();

const clock = new THREE.Clock();
const lookTarget = new THREE.Vector3(-1.5, ROOM_DIMENSIONS.floorY + 2.6, -2.2);

async function init() {
  setupRoom();
  registerClickHandler(app.camera, app.scene);

  try {
    await loadFurnitureModels(app.scene);
  } catch (error) {
    console.error("Failed to load furniture models:", error);
  }

  app.start(() => {
    const elapsed = clock.getElapsedTime();
    const orbit = -Math.PI / 4 + Math.sin(elapsed * 0.12) * 0.22;
    cameraRig.rotation.y = orbit;

    app.camera.position.y = 12 + Math.sin(elapsed * 0.1) * 0.7;
    app.camera.lookAt(lookTarget);
  });
}

function setupRoom() {
  setupLights(app.scene);
  createCornerShell(app.scene);
  createFeatureDivider(app.scene);
  createCeilingCove(app.scene);
  createWindowBench(app.scene);
  createCarpet(app.scene);
  createPictureFrames(app.scene);
  createBookshelf(app.scene);
  createFloatingShelves(app.scene);
  createAccentTable(app.scene);
  createChandelier(app.scene);
}

init();
