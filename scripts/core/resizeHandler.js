import { FRUSTUM_SIZE } from "../config/constants.js";
import { updateRendererSize } from "./renderer.js";

function getAspectRatio(canvas) {
  const fallbackWidth = window.innerWidth;
  const fallbackHeight = window.innerHeight || 1;
  const width = canvas?.clientWidth || fallbackWidth;
  const height = canvas?.clientHeight || fallbackHeight;
  const safeHeight = height === 0 ? 1 : height;
  return Math.max(width, 1) / safeHeight;
}

export function createResizeHandler(camera, renderer, canvas) {
  return function handleResize() {
    const aspect = getAspectRatio(canvas);

    camera.left = (FRUSTUM_SIZE * aspect) / -2;
    camera.right = (FRUSTUM_SIZE * aspect) / 2;
    camera.top = FRUSTUM_SIZE / 2;
    camera.bottom = FRUSTUM_SIZE / -2;
    camera.zoom = aspect < 1 ? 0.6 : 1.0;
    camera.updateProjectionMatrix();

    updateRendererSize(renderer, canvas);
  };
}
