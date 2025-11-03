// Stream_LiveGame :: Three.js 핵심 클래스들을 가져온다.
import * as THREE from "three";
// Stream_LiveGame :: 앱 환경 설정 상수를 불러온다.
import { BACKGROUND_COLOR } from "../constants/environment.js";
// Stream_LiveGame :: 직교 카메라 생성 유틸리티.
import { createOrthographicCamera } from "./createCamera.js";
// Stream_LiveGame :: 렌더러 초기화 유틸리티.
import { createRenderer } from "./createRenderer.js";
// Stream_LiveGame :: 뷰포트 크기 변경에 대응하는 핸들러를 생성한다.
import { createResizeHandler } from "./createResizeHandler.js";

export class ThreeApp {
  constructor({ canvas }) {
    // Stream_LiveGame :: 캔버스가 없으면 앱을 초기화할 수 없으므로 즉시 오류를 발생시킨다.
    if (!canvas) {
      throw new Error("A canvas element is required to initialise ThreeApp.");
    }

    // Stream_LiveGame :: 렌더링에 필요한 핵심 인스턴스를 구성한다.
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(BACKGROUND_COLOR);

    // Stream_LiveGame :: 카메라와 렌더러를 준비하고 리사이즈 핸들러를 결합한다.
    this.camera = createOrthographicCamera();
    this.renderer = createRenderer(this.canvas);

    this.resizeHandler = createResizeHandler(this.camera, this.renderer);
    // Stream_LiveGame :: 초기 화면 크기에 맞게 한 번 렌더러를 조정한다.
    this.resizeHandler();
    // Stream_LiveGame :: 창 크기 변경 이벤트를 구독하여 카메라/렌더러를 재조정한다.
    window.addEventListener("resize", this.resizeHandler);
  }

  start(renderCallback) {
    // Stream_LiveGame :: 애니메이션 루프를 등록하여 프레임마다 렌더링을 수행한다.
    this.renderer.setAnimationLoop(() => {
      if (typeof renderCallback === "function") {
        // Stream_LiveGame :: 외부에서 전달된 업데이트 콜백을 우선 실행.
        renderCallback();
      }
      this.renderer.render(this.scene, this.camera);
    });
  }

  dispose() {
    // Stream_LiveGame :: 렌더 루프와 이벤트 리스너, 렌더러 자원을 모두 해제한다.
    this.renderer.setAnimationLoop(null);
    window.removeEventListener("resize", this.resizeHandler);
    this.renderer.dispose();
  }
}
