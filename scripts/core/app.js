import * as THREE from "three";
import { BACKGROUND_COLOR } from "../config/constants.js";
import { createOrthographicCamera } from "./camera.js";
import { createRenderer } from "./renderer.js";
import { createResizeHandler } from "./resizeHandler.js";

function getCanvasDimensions(canvas) {
  const fallbackWidth = typeof window !== "undefined" ? window.innerWidth : 1;
  const fallbackHeight = typeof window !== "undefined" ? window.innerHeight : 1;
  const width = canvas?.clientWidth || fallbackWidth;
  const height = canvas?.clientHeight || fallbackHeight;
  return { width, height };
}

export class ThreeApp {
  constructor({ canvas }) {
    if (!canvas) {
      throw new Error("A canvas element is required to initialise ThreeApp.");
    }

    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(BACKGROUND_COLOR);

    const initialDimensions = getCanvasDimensions(this.canvas);

    this.camera = createOrthographicCamera(initialDimensions);
    this.renderer = createRenderer(this.canvas, initialDimensions);

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
