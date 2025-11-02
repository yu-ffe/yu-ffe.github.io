import { ThreeApp } from './core/app.js';
import { setupLights } from './lights/lights.js';
import { initializeWinterRoomScene } from './scene/winterRoomScene.js';
import { registerClickHandler } from './events/clickEvents.js';
import { loadBlocks } from './objects/blockManager.js';
import { loadTexts } from './objects/textManager.js';

export function createThreeExperience(canvas) {
  const app = new ThreeApp({ canvas });

  initializeWinterRoomScene(app.scene);
  setupLights(app.scene);

  const removeClickHandler = registerClickHandler(app.camera, app.scene);

  loadBlocks(app.scene);
  loadTexts(app.scene, app.camera);

  app.start();

  return () => {
    removeClickHandler?.();
    app.dispose();
  };
}
