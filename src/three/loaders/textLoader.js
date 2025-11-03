// Stream_LiveGame :: 텍스트 메시 생성을 위한 Three.js 도구 모음.
import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const FONT_URL = "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json";

export async function loadTexts(scene, camera) {
  try {
    // Stream_LiveGame :: 외부 JSON에서 텍스트 정보를 가져온다.
    const response = await fetch("/data/texts.json");
    if (!response.ok) {
      throw new Error(`Unexpected ${response.status} response when fetching text data.`);
    }

    // Stream_LiveGame :: 메시 구성에 필요한 텍스트 배열과 폰트를 준비한다.
    const texts = await response.json();
    const font = await loadFont();

    texts.forEach(({ x, y, z, text, link }) => {
      // Stream_LiveGame :: 문자열을 3D 메시로 변환한다.
      const geometry = new TextGeometry(text, {
        font,
        size: 0.4,
        height: 1,
      });
      geometry.center();

      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData.link = link;
      // Stream_LiveGame :: 항상 카메라를 바라보도록 텍스트 방향을 조정한다.
      mesh.lookAt(camera.position);
      scene.add(mesh);
    });
  } catch (error) {
    // Stream_LiveGame :: 텍스트 로딩 실패 시 로그로 남긴다.
    console.error("Failed to load text data:", error);
  }
}

function loadFont() {
  // Stream_LiveGame :: Three.js FontLoader를 프라미스로 래핑하여 사용한다.
  return new Promise((resolve, reject) => {
    new FontLoader().load(FONT_URL, resolve, undefined, reject);
  });
}
