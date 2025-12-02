// Stream_LiveGame :: 마우스 드래그로 카메라를 회전시키는 오빗 컨트롤 생성기.
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function createOrbitControls(camera, renderer) {
  if (!camera || !renderer) {
    throw new Error("Orbit controls require both a camera and renderer instance.");
  }

  const controls = new OrbitControls(camera, renderer.domElement);

  // Stream_LiveGame :: 사용자가 화면을 드래그해 직관적으로 회전하도록 설정.
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.zoomSpeed = 0.8;
  controls.minZoom = 0.4;
  controls.maxZoom = 1.6;
  controls.target.set(0, 0, 0);
  controls.update();

  return controls;
}
