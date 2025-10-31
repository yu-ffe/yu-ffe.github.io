import * as THREE from "three";

export function createScene({ background = 0x0e0608 } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  return scene;
}
