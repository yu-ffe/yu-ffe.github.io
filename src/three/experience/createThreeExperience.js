import * as THREE from "three";
// Stream_LiveGame :: 렌더 루프, 씬, 카메라를 관리하는 애플리케이션 래퍼.
import { ThreeApp } from "../core/ThreeApp.js";
// Stream_LiveGame :: 씬의 분위기를 조성하는 조명 배치 모듈.
import { setupLights } from "../lights/winterRoomLights.js";
// Stream_LiveGame :: 겨울 방 씬의 지오메트리를 구성한다.
import { initializeTowerRoomScene } from "../scenes/tower-room/index.js";
// Stream_LiveGame :: 객체 클릭 시 링크로 이동하는 상호작용을 등록한다.
import { registerClickNavigation } from "../interactions/clickNavigation.js";
// Stream_LiveGame :: 마우스 드래그를 통한 카메라 회전을 제공한다.
import { createOrbitControls } from "../interactions/orbitControls.js";
// Stream_LiveGame :: 책장 상호작용을 활성화하여 하이라이트와 링크 이동을 지원한다.
import { setupBookshelfInteractions } from "../interactions/bookshelfInteractions.js";
import { setupWindowInteractions } from "../interactions/windowInteractions.js";
// Stream_LiveGame :: 책장에 배치할 링크 메타데이터를 불러온다.
import { loadBookMetadata } from "../loaders/bookMetadataLoader.js";
import { createWalkingCharacter } from "../characters/walkingCharacter.js";

export function createThreeExperience(canvas) {
  // Stream_LiveGame :: Three.js 앱 인스턴스를 생성하여 렌더링 환경을 준비한다.
  const app = new ThreeApp({ canvas });

  // Stream_LiveGame :: 3D 자산 및 장면 구성 요소를 초기화한다.
  const {
    roomGroup,
    bookshelfBooks = [],
    windowDetails,
    updateCallbacks = [],
    ready = Promise.resolve(),
  } = initializeTowerRoomScene(app.scene) ?? {};
  setupLights(app.scene);

  // Stream_LiveGame :: 사용자 클릭을 추적하는 핸들러를 등록하고 제거 함수를 받는다.
  const removeClickHandler = registerClickNavigation(app.camera, app.scene);

  let disposeBookshelfInteractions = () => {};
  const disposeWindowInteractions = setupWindowInteractions(app.camera, windowDetails);
  let isDisposed = false;

  // Stream_LiveGame :: 책장에 배치할 링크 데이터를 불러와 상호작용을 적용한다.
  Promise.all([loadBookMetadata(), ready]).then(([bookEntries]) => {
    if (isDisposed) {
      return;
    }
    disposeBookshelfInteractions = setupBookshelfInteractions(
      app.camera,
      bookshelfBooks,
      bookEntries
    );
  });

  // 이전 모델 A: 방 glb 가 로드되면 캐릭터를 세우고 걸어다니게 한다(WASD/방향키, 바닥 클릭).
  let walker = null;
  ready
    .then(() => (isDisposed ? null : createWalkingCharacter({ scene: app.scene, camera: app.camera, canvas, roomGroup })))
    .then((created) => {
      if (!created) return;
      if (isDisposed) {
        created.dispose();
        return;
      }
      walker = created;
      if (import.meta.env.DEV) window.__walker = created; // 개발 중 디버깅용
    })
    .catch((error) => console.error("walking character failed", error));

  // Stream_LiveGame :: 마우스 드래그 시 카메라를 부드럽게 회전시킨다.
  const orbitControls = createOrbitControls(app.camera, app.renderer);

  const clock = new THREE.Clock();

  // Stream_LiveGame :: 렌더 루프를 시작하여 장면을 계속 업데이트한다.
  app.start(() => {
    const delta = clock.getDelta();
    orbitControls.update();
    walker?.update(delta);
    updateCallbacks.forEach((update) => {
      if (typeof update === "function") {
        update(delta);
      }
    });
  });

  return () => {
    // Stream_LiveGame :: 등록한 이벤트와 Three.js 자원을 정리한다.
    isDisposed = true;
    walker?.dispose();
    disposeBookshelfInteractions?.();
    disposeWindowInteractions?.();
    removeClickHandler?.();
    orbitControls.dispose();
    app.dispose();
  };
}
