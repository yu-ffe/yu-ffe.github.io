import * as THREE from "three";

export function createRenderer(canvas, dimensions = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);

  const fallbackWidth = typeof window !== "undefined" ? window.innerWidth : 1;
  const fallbackHeight = typeof window !== "undefined" ? window.innerHeight : 1;
  const targetWidth = dimensions.width || canvas?.clientWidth || fallbackWidth;
  const targetHeight = dimensions.height || canvas?.clientHeight || fallbackHeight;

  renderer.setSize(targetWidth, targetHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}
