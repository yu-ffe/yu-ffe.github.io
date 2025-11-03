// Stream_LiveGame :: 조명 생성을 위한 Three.js 모듈을 불러온다.
import * as THREE from "three";

export function setupLights(scene) {
  // Stream_LiveGame :: 분위기 조성에 필요한 여러 조명을 순차적으로 배치한다.
  addAmbientGlow(scene);
  addMoonlight(scene);
  addWindowWash(scene);
  addCozyShelfLight(scene);
}

function addAmbientGlow(scene) {
  // Stream_LiveGame :: 하늘/땅 색상을 섞어 기본 주변광을 제공한다.
  const hemi = new THREE.HemisphereLight(0xf0f6ff, 0x1a2734, 0.58);
  scene.add(hemi);
}

function addMoonlight(scene) {
  // Stream_LiveGame :: 달빛을 모사하는 방향성 광원을 추가한다.
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
  // Stream_LiveGame :: 창문 주변의 냉색광을 구성한다.
  const windowLight = new THREE.PointLight(0x7cbcff, 0.72, 36, 1.8);
  windowLight.position.set(-11.5, 1.2, -7.5);
  scene.add(windowLight);

  // Stream_LiveGame :: 서리 낀 효과를 강조하기 위한 스포트라이트.
  const frostFill = new THREE.SpotLight(0xcbdfff, 0.28, 40, Math.PI / 3.4, 0.45, 1.3);
  frostFill.position.set(-8, 12, -14);
  frostFill.target.position.set(-4, 2, -6);
  frostFill.castShadow = false;
  scene.add(frostFill);
  scene.add(frostFill.target);
}

function addCozyShelfLight(scene) {
  // Stream_LiveGame :: 책장 주변에 따뜻한 포인트 라이트를 추가한다.
  const shelfLamp = new THREE.PointLight(0xffd6a1, 0.95, 20, 1.4);
  shelfLamp.position.set(10, 6, -9);
  scene.add(shelfLamp);
}
