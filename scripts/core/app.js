import * as THREE from "three";
import { BACKGROUND_COLOR } from "../config/constants.js";
import { createOrthographicCamera } from "./camera.js";
import { createRenderer } from "./renderer.js";
import { createResizeHandler } from "./resizeHandler.js";

export class ThreeApp {
  constructor({ canvas }) {
    if (!canvas) {
      throw new Error("A canvas element is required to initialise ThreeApp.");
    }

    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(BACKGROUND_COLOR);

    const { clientWidth, clientHeight } = this.canvas;
    const aspect = clientHeight === 0 ? 1 : Math.max(clientWidth, 1) / clientHeight;

    this.camera = createOrthographicCamera(aspect);
    this.renderer = createRenderer(this.canvas);

    this.resizeHandler = createResizeHandler(this.camera, this.renderer, this.canvas);
    this.resizeHandler();
    window.addEventListener("resize", this.resizeHandler);
  }

  start(renderCallback) {
    this.renderer.setAnimationLoop(() => {
      if (typeof renderCallback === "function") {
        renderCallback();
      }
      this.renderer.render(this.scene, this.camera);
    });
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener("resize", this.resizeHandler);
    this.renderer.dispose();
  }
}
