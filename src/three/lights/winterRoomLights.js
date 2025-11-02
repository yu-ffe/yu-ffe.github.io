import * as THREE from "three";

export function setupLights(scene) {
  addAmbientGlow(scene);
  addMoonlight(scene);
  addWindowWash(scene);
  addRimAccent(scene);
  addCozyShelfLight(scene);
}

function addAmbientGlow(scene) {
  const hemi = new THREE.HemisphereLight(0xf0f6ff, 0x1a2734, 0.58);
  scene.add(hemi);
}

function addMoonlight(scene) {
  const moon = new THREE.DirectionalLight(0xbcd9ff, 0.75);
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
  const windowLight = new THREE.PointLight(0x7cbcff, 0.72, 36, 1.8);
  windowLight.position.set(-11.5, 1.2, -7.5);
  scene.add(windowLight);

  const frostFill = new THREE.SpotLight(0xcbdfff, 0.38, 46, Math.PI / 3, 0.35, 1.4);
  frostFill.position.set(18, 18, 24);
  frostFill.target.position.set(0, -6, -2);
  frostFill.castShadow = false;
  scene.add(frostFill);
  scene.add(frostFill.target);
}

function addRimAccent(scene) {
  const rim = new THREE.PointLight(0xb5d8ff, 0.45, 42, 1.6);
  rim.position.set(12, 4, 10);
  scene.add(rim);
}

function addCozyShelfLight(scene) {
  const shelfLamp = new THREE.PointLight(0xffd6a1, 1.15, 24, 1.4);
  shelfLamp.position.set(10, 6, -9);
  scene.add(shelfLamp);

  const frameGlow = new THREE.SpotLight(0xffcaa6, 0.65, 18, Math.PI / 4, 0.48, 1.8);
  frameGlow.position.set(-12, 7.2, 8);
  frameGlow.target.position.set(-10.2, 4.8, 6);
  scene.add(frameGlow);
  scene.add(frameGlow.target);
}
