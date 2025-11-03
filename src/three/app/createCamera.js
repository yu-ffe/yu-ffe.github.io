// Stream_LiveGame :: Three.js 카메라 구성에 필요한 클래스를 불러온다.
import * as THREE from "three";
// Stream_LiveGame :: 카메라 투영 범위를 정의하는 상수들.
import {
  FRUSTUM_SIZE,
  CAMERA_CLIP_NEAR,
  CAMERA_CLIP_FAR,
} from "../constants/environment.js";

export function createOrthographicCamera(
  aspect = window.innerWidth / window.innerHeight
) {
  // Stream_LiveGame :: 화면 비율을 기준으로 직교 카메라 경계를 계산한다.
  const camera = new THREE.OrthographicCamera(
    (FRUSTUM_SIZE * aspect) / -2,
    (FRUSTUM_SIZE * aspect) / 2,
    FRUSTUM_SIZE / 2,
    FRUSTUM_SIZE / -2,
    CAMERA_CLIP_NEAR,
    CAMERA_CLIP_FAR
  );
  // Stream_LiveGame :: 방 전체가 보이도록 대각선 위치에 카메라를 배치한다.
  camera.position.set(50, 50, 50);
  // Stream_LiveGame :: 씬 중앙을 바라보도록 설정한다.
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}
