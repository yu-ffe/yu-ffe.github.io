// Stream_LiveGame :: 카메라 투영 크기를 계산하기 위한 상수.
import { FRUSTUM_SIZE } from "../constants/environment.js";

export function createResizeHandler(camera, renderer) {
  return function handleResize() {
    // Stream_LiveGame :: 현재 창 크기를 측정한다.
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    // Stream_LiveGame :: 직교 카메라의 투영 경계를 새로운 비율로 갱신.
    camera.left = (FRUSTUM_SIZE * aspect) / -2;
    camera.right = (FRUSTUM_SIZE * aspect) / 2;
    camera.top = FRUSTUM_SIZE / 2;
    camera.bottom = FRUSTUM_SIZE / -2;
    // Stream_LiveGame :: 세로 화면일 때는 더 넓게 보기 위해 줌을 낮춘다.
    camera.zoom = aspect < 1 ? 0.5 : 0.85;
    camera.updateProjectionMatrix();

    // Stream_LiveGame :: 렌더러 뷰포트도 동일한 크기로 조정한다.
    renderer.setSize(width, height);
  };
}
