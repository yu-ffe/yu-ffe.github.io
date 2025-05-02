import * as THREE from "three";
import { handleClick } from "./events/clickEvents.js";
import { createTerrain } from "./objects/terrain.js";
import { loadBlocks } from "./objects/blockManager.js"; // 블록 로드 추가
import { loadTexts } from "./objects/textManager.js";


// 씬 생성
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 15); // 카메라 위치 조정
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("webgl-canvas") });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 조명 추가
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// 지형 및 블록 추가
createTerrain(scene);
loadBlocks(scene); // JSON 기반 블록 로드 추가
loadTexts(scene, camera);



// 오브젝트 및 이벤트 초기화
handleClick(camera, scene, renderer);


// 창 크기 변경 시 캔버스 크기 조정
window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();