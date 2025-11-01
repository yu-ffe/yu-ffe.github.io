import * as THREE from "three";
import {
  CAMERA_FOV,
  CAMERA_CLIP_NEAR,
  CAMERA_CLIP_FAR,
} from "../config/constants.js";

export function createPerspectiveCamera(aspect = window.innerWidth / window.innerHeight) {
  const camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    aspect,
    CAMERA_CLIP_NEAR,
    CAMERA_CLIP_FAR
  );
  camera.position.set(26, 18, 34);
  camera.lookAt(new THREE.Vector3(-1.5, 2, -1));
  return camera;
}
