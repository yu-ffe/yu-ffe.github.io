import * as THREE from "three";
import { handleClick } from "./events/clickEvents.js";
import { createFloor } from "./objects/floor.js";
import { createWalls } from "./objects/walls.js";
import { createSurfaceFinishCubes } from "./objects/surfaceFinish.js";
import { loadBlocks } from "./objects/blockManager.js";
import { loadTexts } from "./objects/textManager.js";
import { setupLights } from "./lights/lights.js"; // ✅ 추가
import { createCharacter } from "./objects/characterController.js";


const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb55d27);

// 카메라 생성
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 30;
const camera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  frustumSize / -2,
  0.1,
  1000
);
camera.position.set(40, 40, 40);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("webgl-canvas"),
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ✅ 조명 분리
setupLights(scene, renderer); // renderer 전달

// 테스트용 큐브
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff5555 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(2, 10, -10);
scene.add(cube);

// 지형 및 블록
createFloor(scene);
createWalls(scene);
loadBlocks(scene);
loadTexts(scene, camera);

// 이벤트 처리
handleClick(camera, scene, renderer);

// 리사이즈 대응
function updateCamera() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;

  camera.left = (frustumSize * aspect) / -2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;

  camera.zoom = aspect < 1 ? 0.6 : 1.0;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
updateCamera();
window.addEventListener("resize", updateCamera);

// 루프
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
createCharacter(scene, camera); // ✅ 카메라 넘겨줌
