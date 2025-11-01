import * as THREE from "three";
import { FRUSTUM_SIZE, CAMERA_CLIP_NEAR, CAMERA_CLIP_FAR } from "../config/constants.js";

export function createOrthographicCamera(aspect = 1) {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const camera = new THREE.OrthographicCamera(
    (FRUSTUM_SIZE * safeAspect) / -2,
    (FRUSTUM_SIZE * safeAspect) / 2,
    FRUSTUM_SIZE / 2,
    FRUSTUM_SIZE / -2,
    CAMERA_CLIP_NEAR,
    CAMERA_CLIP_FAR
  );
  camera.position.set(50, 50, 50);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}
