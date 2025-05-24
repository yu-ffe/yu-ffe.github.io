import * as THREE from "three";
import { handleClick } from "./events/clickEvents.js";
import { createFloor } from "./objects/floor.js";
import { createWalls } from "./objects/walls.js";
import { loadBlocks } from "./objects/blockManager.js";
import { loadTexts } from "./objects/textManager.js";

// 씬 생성
const scene = new THREE.Scene();

// 아이소메트릭 카메라 생성
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 30;  // 적당한 시야 크기, 너무 크면 너무 멀리 보임


const camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2, // left
    (frustumSize * aspect) / 2,  // right
    frustumSize / 2,             // top
    frustumSize / -2,            // bottom
    0.1,                        // near
    1000                        // far
);

// 아이소메트릭 뷰 위치와 각도
camera.position.set(40, 40, 40);  // X, Y, Z 대각선 방향으로 배치
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("webgl-canvas") });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 조명 추가
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 15, -10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// 지형 및 블록 추가
createFloor(scene);
createWalls(scene);
loadBlocks(scene);
loadTexts(scene, camera);

// 이벤트 초기화
handleClick(camera, scene, renderer);

// 리사이즈 시 카메라와 렌더러 업데이트
window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    camera.left = (frustumSize * aspect) / -2;
    camera.right = (frustumSize * aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
