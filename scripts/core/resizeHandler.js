import { FRUSTUM_SIZE } from "../config/constants.js";

function getDisplaySize(canvas) {
  const width =
    canvas.clientWidth ||
    canvas.parentElement?.clientWidth ||
    window.innerWidth ||
    1;
  const height =
    canvas.clientHeight ||
    canvas.parentElement?.clientHeight ||
    window.innerHeight ||
    1;

  return {
    width: Math.max(1, Math.floor(width)),
    height: Math.max(1, Math.floor(height)),
  };
}

export function createResizeHandler(canvas, camera, renderer) {
  let resizeObserver = null;

  const handleResize = () => {
    const { width, height } = getDisplaySize(canvas);
    const aspect = width / height;

    camera.left = (FRUSTUM_SIZE * aspect) / -2;
    camera.right = (FRUSTUM_SIZE * aspect) / 2;
    camera.top = FRUSTUM_SIZE / 2;
    camera.bottom = FRUSTUM_SIZE / -2;
    camera.zoom = aspect < 1 ? 0.6 : 1.0;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
  };

  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);
  }

  handleResize.dispose = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  };

  return handleResize;
}
