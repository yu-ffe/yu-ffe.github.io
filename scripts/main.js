import * as THREE from "three";
import { handleClick } from "./events/clickEvents.js";
import { createFloor } from "./objects/floor.js";
import { createWalls } from "./objects/walls.js";
import { createSurfaceFinishCubes } from "./objects/surfaceFinish.js";
import { loadBlocks } from "./objects/blockManager.js";
import { loadTexts } from "./objects/textManager.js";
import { createTable } from "./objects/table.js";
import { setupLights } from "./lights/lights.js"; // ✅ 추가

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0E0608);

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
camera.position.set(50, 50, 50);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("webgl-canvas"),
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ✅ 조명 분리
setupLights(scene, renderer); // renderer 전달

// 지형 및 블록
createFloor(scene);
createWalls(scene);
// loadBlocks(scene);
// loadTexts(scene, camera);
createTable(scene); // ✅ 테이블 생성

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



/// WILL BE DELTED LATER ///
const textureLoader = new THREE.TextureLoader();
textureLoader.load("./image/else/62f9297e-48f1-422a-a234-e57aa98763d2.png", (texture) => {
  const geometry = new THREE.PlaneGeometry(10, 10); // 크기 조정
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true, // PNG 투명도 유지
  });
  const imagePlane = new THREE.Mesh(geometry, material);

  // 위치와 회전 설정 (정면으로 보이게)
  imagePlane.position.set(0, 5, 0);
  // imagePlane.rotation.y = Math.PI / 4; // 필요시 조정

  scene.add(imagePlane);
});

const textureLoader2 = new THREE.TextureLoader();
textureLoader2.load("./image/else/62f9297e-48f1-422a-a234-e57aa98763d3.png", (texture) => {
  const geometry2 = new THREE.PlaneGeometry(10, 10); // 크기 조정
  const material2 = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true, // PNG 투명도 유지
  });
  const imagePlane2 = new THREE.Mesh(geometry2, material2);

  // 위치와 회전 설정 (정면으로 보이게)
  imagePlane2.position.set(10, 5, 0);
  // imagePlane.rotation.y = Math.PI / 4; // 필요시 조정

  scene.add(imagePlane2);
});