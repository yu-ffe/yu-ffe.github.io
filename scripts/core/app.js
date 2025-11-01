import * as THREE from "three";
import { BACKGROUND_COLOR } from "../config/constants.js";
import { createPerspectiveCamera } from "./camera.js";
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

    this.camera = createPerspectiveCamera();
    this.renderer = createRenderer(this.canvas);

    this.resizeHandler = createResizeHandler(this.camera, this.renderer);
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
