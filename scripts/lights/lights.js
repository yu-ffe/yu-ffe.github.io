import * as THREE from "three";

export function setupLights(scene) {
  addAmbientGlow(scene);
  addMoonlight(scene);
  addWindowWash(scene);
}

function addAmbientGlow(scene) {
  const hemi = new THREE.HemisphereLight(0xdcecff, 0x132335, 0.6);
  scene.add(hemi);
}

function addMoonlight(scene) {
  const moon = new THREE.DirectionalLight(0x9fcfff, 0.85);
  moon.position.set(-32, 34, 22);
  moon.target.position.set(-6, -4, -10);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.near = 5;
  moon.shadow.camera.far = 140;
  moon.shadow.camera.left = -45;
  moon.shadow.camera.right = 35;
  moon.shadow.camera.top = 40;
  moon.shadow.camera.bottom = -40;
  scene.add(moon);
  scene.add(moon.target);
}

function addWindowWash(scene) {
  const windowLight = new THREE.PointLight(0x7cbcff, 0.9, 36, 1.8);
  windowLight.position.set(-11.5, 1.2, -7.5);
  scene.add(windowLight);

  const frostFill = new THREE.SpotLight(0xbdd9ff, 0.45, 46, Math.PI / 3, 0.35, 1.4);
  frostFill.position.set(18, 18, 24);
  frostFill.target.position.set(0, -6, -2);
  frostFill.castShadow = false;
  scene.add(frostFill);
  scene.add(frostFill.target);
}

