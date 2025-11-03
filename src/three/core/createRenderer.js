// Stream_LiveGame :: 렌더러 구성에 사용할 Three.js 모듈.
import * as THREE from "three";

export function createRenderer(canvas) {
  // Stream_LiveGame :: 안티앨리어싱과 함께 WebGL 렌더러를 초기화한다.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  // Stream_LiveGame :: 고해상도 디스플레이에서 과도한 픽셀 밀도를 제한한다.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Stream_LiveGame :: 현재 창 크기에 맞춰 렌더러 뷰포트를 설정한다.
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Stream_LiveGame :: sRGB 색 공간으로 보정하여 색상을 정확하게 표현한다.
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Stream_LiveGame :: 그림자 매핑을 활성화하여 깊이감을 표현한다.
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}
