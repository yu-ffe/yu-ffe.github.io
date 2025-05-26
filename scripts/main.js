import * as THREE from "three";
import { handleClick } from "./events/clickEvents.js";
import { createFloor } from "./objects/floor.js";
import { createWalls } from "./objects/walls.js";
import { createSurfaceFinishCubes } from "./objects/surfaceFinish.js";
import { loadBlocks } from "./objects/blockManager.js";
import { loadTexts } from "./objects/textManager.js";

// 씬 생성
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.background = new THREE.Color(0x2e2e2e);
scene.background = new THREE.Color(0x364b6e);
scene.background = new THREE.Color(0x014d4e);
scene.background = new THREE.Color(0xa0a0a0);
scene.background = new THREE.Color(0x4c5b7c);
scene.background = new THREE.Color(0x3f888f);
scene.background = new THREE.Color(0x2c3e50);
scene.background = new THREE.Color(0x00ff95);
scene.background = new THREE.Color(0xb55d27);

// 아이소메트릭 카메라 생성
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 30; // 적당한 시야 크기, 너무 크면 너무 멀리 보임

const camera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -2, // left
  (frustumSize * aspect) / 2, // right
  frustumSize / 2, // top
  frustumSize / -2, // bottom
  0.1, // near
  1000 // far
);

// 아이소메트릭 뷰 위치와 각도
camera.position.set(40, 40, 40); // X, Y, Z 대각선 방향으로 배치
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("webgl-canvas"),
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 조명 추가
const light = new THREE.DirectionalLight(0xffffff, 7);
light.position.set(2, 10, -10);
light.lookAt(0, 0, 0); // 씬 중앙을 바라보도록 설정
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, .1);
scene.add(ambientLight);


// 큐브 추가 (조명보다 Y축 +1 위)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff5555 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(2, 10, -10); // light.position 기준으로 y +1
scene.add(cube);

// 지형 및 블록 추가
createFloor(scene);
createWalls(scene);
// createSurfaceFinishCubes(scene); // ← 여기에 추가
loadBlocks(scene);
loadTexts(scene, camera);

// 이벤트 초기화
handleClick(camera, scene, renderer);

// 리사이즈 시 카메라와 렌더러 업데이트
function updateCamera() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;

  camera.left = (frustumSize * aspect) / -2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;

  // 세로 화면 대응: 비율 좁으면 씬 전체 축소
  if (aspect < 1) {
    camera.zoom = 0.6; // 필요시 더 낮춰도 됨
  } else {
    camera.zoom = 1.0;
  }

  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// 최초 설정
updateCamera();

// 리사이즈 대응
window.addEventListener("resize", updateCamera);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
