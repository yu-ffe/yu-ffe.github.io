import { ThreeApp } from "./core/app.js";

const canvas = document.getElementById("webgl-canvas");
const app = new ThreeApp({ canvas });

function init() {
  app.start();
}

init();
