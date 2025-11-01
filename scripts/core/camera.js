import * as THREE from "three";
import { FRUSTUM_SIZE, CAMERA_CLIP_NEAR, CAMERA_CLIP_FAR } from "../config/constants.js";

export function calculateFrustumBounds(aspect) {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;

  if (safeAspect >= 1) {
    const halfWidth = (FRUSTUM_SIZE * safeAspect) / 2;
    const halfHeight = FRUSTUM_SIZE / 2;
    return {
      left: -halfWidth,
      right: halfWidth,
      top: halfHeight,
      bottom: -halfHeight,
    };
  }

  const halfWidth = FRUSTUM_SIZE / 2;
  const halfHeight = FRUSTUM_SIZE / safeAspect / 2;
  return {
    left: -halfWidth,
    right: halfWidth,
    top: halfHeight,
    bottom: -halfHeight,
  };
}

export function createOrthographicCamera({ width, height } = {}) {
  const fallbackWidth = typeof window !== "undefined" ? window.innerWidth : 1;
  const fallbackHeight = typeof window !== "undefined" ? window.innerHeight : 1;
  const aspect = (width || fallbackWidth) / (height || fallbackHeight);
  const bounds = calculateFrustumBounds(aspect);

  const camera = new THREE.OrthographicCamera(
    bounds.left,
    bounds.right,
    bounds.top,
    bounds.bottom,
    CAMERA_CLIP_NEAR,
    CAMERA_CLIP_FAR
  );
  camera.position.set(50, 50, 50);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}
