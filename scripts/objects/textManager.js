import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

export function loadTexts(scene, camera) { // 🔹 camera 매개변수 추가
    fetch("./data/texts.json")
        .then(response => response.json())
        .then(texts => {
            const fontLoader = new FontLoader();
            fontLoader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", (font) => {
                texts.forEach((textData) => {
                    const { x, y, z, text, link } = textData;

                    // 텍스트 생성
                    const textGeometry = new TextGeometry(text, {
                        font: font,
                        size: 0.4,
                        height: 1
                    });

                    textGeometry.center(); // 텍스트 중앙 정렬
                    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
                    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

                    textMesh.position.set(x, y, z);
                    textMesh.userData.link = link;

                    // 🔹 항상 카메라를 향하도록 설정
                    textMesh.lookAt(camera.position);

                    scene.add(textMesh);
                });
            });
        })
        .catch(error => console.error("텍스트 데이터를 불러오는 중 오류 발생:", error));
}