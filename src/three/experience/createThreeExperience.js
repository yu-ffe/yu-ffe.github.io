import { ThreeApp } from "../app/ThreeApp.js";
import { setupLights } from "../lights/winterRoomLights.js";
import { initializeWinterRoomScene } from "../scenes/winter-room/index.js";
import { registerClickNavigation } from "../interactions/clickNavigation.js";
import { loadBlocks } from "../loaders/blockLoader.js";
import { loadTexts } from "../loaders/textLoader.js";

export function createThreeExperience(canvas) {
  const app = new ThreeApp({ canvas });

  initializeWinterRoomScene(app.scene);
  setupLights(app.scene);

  const removeClickHandler = registerClickNavigation(app.camera, app.scene);

  loadBlocks(app.scene);
  loadTexts(app.scene, app.camera);

  app.start();

  return () => {
    removeClickHandler?.();
    app.dispose();
  };
}
