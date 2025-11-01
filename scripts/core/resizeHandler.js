import { calculateFrustumBounds } from "./camera.js";

export function createResizeHandler(camera, renderer, canvas) {
  return function handleResize() {
    const targetWidth = canvas?.clientWidth || window.innerWidth || 1;
    const targetHeight = canvas?.clientHeight || window.innerHeight || 1;
    if (targetHeight === 0) {
      return;
    }

    const aspect = targetWidth / targetHeight;
    const bounds = calculateFrustumBounds(aspect);

    camera.left = bounds.left;
    camera.right = bounds.right;
    camera.top = bounds.top;
    camera.bottom = bounds.bottom;
    camera.updateProjectionMatrix();

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(targetWidth, targetHeight, false);
  };
}
