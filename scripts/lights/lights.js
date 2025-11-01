import * as THREE from "three";

export function setupLights(scene) {
  addAmbient(scene);
  addMoonLight(scene);
  addChandelierLight(scene);
  addShelfAccent(scene);
  addRimLight(scene);
}

function addAmbient(scene) {
  const ambient = new THREE.AmbientLight(0x12253a, 0.6);
  scene.add(ambient);
}

function addMoonLight(scene) {
  const moon = new THREE.DirectionalLight(0x6be7ff, 0.5);
  moon.position.set(-16, 18, 16);
  moon.target.position.set(-3, -3, -1);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  moon.shadow.camera.near = 2;
  moon.shadow.camera.far = 60;
  moon.shadow.camera.left = -20;
  moon.shadow.camera.right = 20;
  moon.shadow.camera.top = 20;
  moon.shadow.camera.bottom = -20;
  scene.add(moon);
  scene.add(moon.target);
}

function addChandelierLight(scene) {
  const chandelier = new THREE.PointLight(0xffe6bd, 1.8, 30, 2.2);
  chandelier.position.set(-0.3, 9.6, -1.1);
  chandelier.castShadow = true;
  chandelier.shadow.mapSize.set(1024, 1024);
  scene.add(chandelier);
}

function addShelfAccent(scene) {
  const accent = new THREE.SpotLight(0x66f5d6, 0.8, 24, Math.PI / 4.4, 0.5, 1);
  accent.position.set(6.2, 10.5, -4.2);
  accent.target.position.set(3.8, -3.5, -6);
  accent.castShadow = true;
  accent.shadow.mapSize.set(1024, 1024);
  scene.add(accent);
  scene.add(accent.target);
}

function addRimLight(scene) {
  const rim = new THREE.PointLight(0x3cf6c8, 0.45, 26, 2);
  rim.position.set(-7, -0.5, 8);
  scene.add(rim);
}
