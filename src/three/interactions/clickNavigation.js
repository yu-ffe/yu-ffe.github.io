// Stream_LiveGame :: 클릭 레이캐스팅을 위해 Three.js 도구를 사용한다.
import * as THREE from "three";

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

export function registerClickNavigation(camera, scene) {
  // Stream_LiveGame :: 클릭 위치를 월드 좌표로 투영하여 링크를 탐색한다.
  function handleClick(event) {
    // Stream_LiveGame :: 픽셀 좌표를 정규화된 장치 좌표계로 변환.
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Stream_LiveGame :: 카메라와 마우스 위치를 기반으로 광선을 쏜다.
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    const [firstHit] = intersects;
    if (firstHit && firstHit.object?.userData?.link) {
      // Stream_LiveGame :: 사용자 데이터에 저장된 링크를 새 탭 또는 동일 탭에서 연다.
      const target = firstHit.object.userData.target ?? "_blank";
      window.open(firstHit.object.userData.link, target);
    }
  }

  // Stream_LiveGame :: 전역 클릭 이벤트에 핸들러를 등록한다.
  window.addEventListener("click", handleClick);

  return () => {
    // Stream_LiveGame :: 정리 시 이벤트 리스너를 제거한다.
    window.removeEventListener("click", handleClick);
  };
}
