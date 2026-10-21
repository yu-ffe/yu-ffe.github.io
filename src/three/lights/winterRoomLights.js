// Stream_LiveGame :: 조명 생성을 위한 Three.js 모듈을 불러온다.
import * as THREE from "three";

export function setupLights(scene) {
  // Stream_LiveGame :: 분위기 조성에 필요한 여러 조명을 순차적으로 배치한다.
  addAmbientGlow(scene);
  addMoonlight(scene);
}

function addAmbientGlow(scene) {
  // Stream_LiveGame :: 하늘/땅 색상을 섞어 기본 주변광을 제공한다.
  const hemi = new THREE.HemisphereLight(0xf0f6ff, 0x3a2f28, 1.0);
  scene.add(hemi);
}

function addMoonlight(scene) {
  // Stream_LiveGame :: 달빛을 모사하는 방향성 광원을 추가한다.
  const moon = new THREE.DirectionalLight(0xdbe8ff, 1.1);
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
