import * as THREE from "three";

export function setupLights(scene) {
  addSunLight(scene);
  addLEDLight(scene);
  addLamp1(scene);
  addLamp2(scene);
  addLantern(scene);
  addGlowingCube(scene);
}

function addSunLight(scene) {
  const sunLight = new THREE.DirectionalLight(0xffffff, 0.7);
  sunLight.position.set(10, 10, -20);
  sunLight.target.position.set(-9, 0, 0);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -20;
  sunLight.shadow.camera.right = 20;
  sunLight.shadow.camera.top = 20;
  sunLight.shadow.camera.bottom = -20;
  scene.add(sunLight);
  scene.add(sunLight.target);
}

function addLEDLight(scene) {
  const led = new THREE.RectAreaLight(0xddeeff, 1.5, 10, 10);
  led.position.set(0, 9, 0);
  led.lookAt(0, 0, 0);
  scene.add(led);
}

function addLamp1(scene) {
  const light = new THREE.PointLight(0xffccaa, 1.2, 10);
  light.position.set(9, -4, -8);
  scene.add(light);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffccaa,
      emissive: 0xffccaa,
      emissiveIntensity: 1,
    })
  );
  mesh.position.copy(light.position);
  scene.add(mesh);
}

function addLamp2(scene) {
  const spot = new THREE.SpotLight(0xffaa55, 20, 15, Math.PI / 6, 0.3);
  spot.position.set(5, -1, -7);
  spot.target.position.set(5, -2, -7);
  scene.add(spot);
  scene.add(spot.target);

  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.5, 12),
    new THREE.MeshStandardMaterial({ color: 0x552200 })
  );
  stand.position.copy(spot.position);
  scene.add(stand);
}

function addLantern(scene) {
  const light = new THREE.PointLight(0xff8800, 1.5, 10);
  light.position.set(-8, 1.2, -2);
  scene.add(light);

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0x222222,
      emissive: 0xff8800,
      emissiveIntensity: 2,
    })
  );
  body.position.copy(light.position);
  scene.add(body);
}

function addGlowingCube(scene) {
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    emissive: 0xffddaa,
    emissiveIntensity: 2.5,
    transparent: true,
    opacity: 1,
  });

  const cube = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 1), glowMat);
  cube.position.set(-5, 1, -11);
  scene.add(cube);
}
