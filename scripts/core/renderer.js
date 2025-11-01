import * as THREE from "three";

function getCanvasDimensions(canvas) {
  const fallbackWidth = window.innerWidth;
  const fallbackHeight = window.innerHeight || 1;

  if (!canvas) {
    return {
      width: Math.max(1, fallbackWidth),
      height: Math.max(1, fallbackHeight),
    };
  }

  const width = canvas.clientWidth || fallbackWidth;
  const height = canvas.clientHeight || fallbackHeight;

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
}

export function updateRendererSize(renderer, canvas) {
  const { width, height } = getCanvasDimensions(canvas);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
}

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  updateRendererSize(renderer, canvas);
  return renderer;
}
