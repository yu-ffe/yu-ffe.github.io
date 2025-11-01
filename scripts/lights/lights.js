import * as THREE from "three";

export function setupLights(scene) {
  addAmbient(scene);
  addWindowLight(scene);
  addFireplaceLight(scene);
  addAccentFill(scene);
}

function addAmbient(scene) {
  const ambient = new THREE.AmbientLight(0x1a2736, 0.55);
  scene.add(ambient);
}

function addWindowLight(scene) {
  const windowLight = new THREE.DirectionalLight(0x8dc7ff, 0.8);
  windowLight.position.set(-22, 18, 8);
  windowLight.target.position.set(-6, -4, -2);
  windowLight.castShadow = true;
  windowLight.shadow.mapSize.set(2048, 2048);
  windowLight.shadow.camera.near = 4;
  windowLight.shadow.camera.far = 80;
  windowLight.shadow.camera.left = -24;
  windowLight.shadow.camera.right = 16;
  windowLight.shadow.camera.top = 22;
  windowLight.shadow.camera.bottom = -18;
  scene.add(windowLight);
  scene.add(windowLight.target);
}

function addFireplaceLight(scene) {
  const glow = new THREE.PointLight(0xffb56b, 1.4, 20, 1.8);
  glow.position.set(2.2, 2.6, -6.5);
  glow.castShadow = true;
  glow.shadow.mapSize.set(1024, 1024);
  scene.add(glow);

  const mantleGlow = new THREE.SpotLight(0xfdd6a3, 0.5, 30, Math.PI / 3.2, 0.35, 1.5);
  mantleGlow.position.set(2.4, 7.5, -7.2);
  mantleGlow.target.position.set(2.2, 4.2, -6.8);
  mantleGlow.castShadow = true;
  scene.add(mantleGlow);
  scene.add(mantleGlow.target);
}

function addAccentFill(scene) {
  const fill = new THREE.PointLight(0x52d6b7, 0.45, 28, 2.2);
  fill.position.set(-10, 3.2, 4.8);
  scene.add(fill);

  const rim = new THREE.PointLight(0x2f88ff, 0.35, 32, 2);
  rim.position.set(10, 9, 10);
  scene.add(rim);
}
