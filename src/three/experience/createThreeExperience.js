// Stream_LiveGame :: 렌더 루프, 씬, 카메라를 관리하는 애플리케이션 래퍼.
import { ThreeApp } from "../app/ThreeApp.js";
// Stream_LiveGame :: 씬의 분위기를 조성하는 조명 배치 모듈.
import { setupLights } from "../lights/winterRoomLights.js";
// Stream_LiveGame :: 겨울 방 씬의 지오메트리를 구성한다.
import { initializeWinterRoomScene } from "../scenes/winter-room/index.js";
// Stream_LiveGame :: 객체 클릭 시 링크로 이동하는 상호작용을 등록한다.
import { registerClickNavigation } from "../interactions/clickNavigation.js";
// Stream_LiveGame :: 책장 상호작용(하이라이트/호버)을 설정한다.
import { setupBookshelfInteractions } from "../interactions/bookshelfInteractions.js";
// Stream_LiveGame :: (비활성화됨) 블록 데이터를 불러와 배치하는 로더.
import { loadBlocks } from "../loaders/blockLoader.js";
// Stream_LiveGame :: (비활성화됨) 텍스트 메시를 생성하는 로더.
import { loadTexts } from "../loaders/textLoader.js";

export function createThreeExperience(canvas) {
  // Stream_LiveGame :: Three.js 앱 인스턴스를 생성하여 렌더링 환경을 준비한다.
  const app = new ThreeApp({ canvas });

  // Stream_LiveGame :: 3D 자산 및 장면 구성 요소를 초기화한다.
  initializeWinterRoomScene(app.scene);
  setupLights(app.scene);

  // Stream_LiveGame :: 사용자 클릭을 추적하는 핸들러를 등록하고 제거 함수를 받는다.
  const removeClickHandler = registerClickNavigation(app.camera, app.scene);
  const removeBookshelfInteractions = setupBookshelfInteractions(app.camera, app.scene);

  // loadBlocks(app.scene);
  // loadTexts(app.scene, app.camera);

  // Stream_LiveGame :: 렌더 루프를 시작하여 장면을 계속 업데이트한다.
  app.start();

  return () => {
    // Stream_LiveGame :: 등록한 이벤트와 Three.js 자원을 정리한다.
    removeClickHandler?.();
    removeBookshelfInteractions?.();
    app.dispose();
  };
}
