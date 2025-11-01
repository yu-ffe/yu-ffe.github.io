import * as THREE from "three";

export function setupLights(scene) {
  addAmbient(scene);
  addMoonLight(scene);
  addChandelierLight(scene);
  addShelfAccent(scene);
  addRimLight(scene);
}

function addAmbient(scene) {
  const ambient = new THREE.AmbientLight(0x1a2232, 0.65);
  scene.add(ambient);
}

function addMoonLight(scene) {
  const moon = new THREE.DirectionalLight(0x5ed7ff, 0.55);
  moon.position.set(-14, 18, 12);
  moon.target.position.set(-2, -4, -1);
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
  const chandelier = new THREE.PointLight(0xffe6bd, 1.6, 28, 2);
  chandelier.position.set(-0.5, 9.5, -1.2);
  chandelier.castShadow = true;
  chandelier.shadow.mapSize.set(1024, 1024);
  scene.add(chandelier);
}

function addShelfAccent(scene) {
  const accent = new THREE.SpotLight(0x7ff2d3, 0.9, 22, Math.PI / 4.2, 0.45, 1);
  accent.position.set(6.5, 10, -4.5);
  accent.target.position.set(3.5, -4, -6);
  accent.castShadow = true;
  accent.shadow.mapSize.set(1024, 1024);
  scene.add(accent);
  scene.add(accent.target);
}

function addRimLight(scene) {
  const rim = new THREE.PointLight(0x3cf6c8, 0.5, 25, 2);
  rim.position.set(-6, -1, 8);
  scene.add(rim);
}
