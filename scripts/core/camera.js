import * as THREE from "three";
import {
  CAMERA_FOV,
  CAMERA_CLIP_NEAR,
  CAMERA_CLIP_FAR,
  CAMERA_INITIAL_POSITION,
  CAMERA_LOOK_AT,
} from "../config/constants.js";

export function createPerspectiveCamera(aspect = window.innerWidth / window.innerHeight) {
  const camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    aspect,
    CAMERA_CLIP_NEAR,
    CAMERA_CLIP_FAR
  );

  camera.position.set(
    CAMERA_INITIAL_POSITION.x,
    CAMERA_INITIAL_POSITION.y,
    CAMERA_INITIAL_POSITION.z
  );

  camera.lookAt(
    new THREE.Vector3(CAMERA_LOOK_AT.x, CAMERA_LOOK_AT.y, CAMERA_LOOK_AT.z)
  );

  return camera;
}
