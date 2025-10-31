import { FRUSTUM_SIZE } from "../config/constants.js";

export function createResizeHandler(camera, renderer) {
  return function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    camera.left = (FRUSTUM_SIZE * aspect) / -2;
    camera.right = (FRUSTUM_SIZE * aspect) / 2;
    camera.top = FRUSTUM_SIZE / 2;
    camera.bottom = FRUSTUM_SIZE / -2;
    camera.zoom = aspect < 1 ? 0.6 : 1.0;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  };
}
