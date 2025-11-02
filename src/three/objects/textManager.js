import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const FONT_URL = "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json";

export async function loadTexts(scene, camera) {
  try {
    const response = await fetch("/data/texts.json");
    if (!response.ok) {
      throw new Error(`Unexpected ${response.status} response when fetching text data.`);
    }

    const texts = await response.json();
    const font = await loadFont();

    texts.forEach(({ x, y, z, text, link }) => {
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
      mesh.lookAt(camera.position);
      scene.add(mesh);
    });
  } catch (error) {
    console.error("Failed to load text data:", error);
  }
}

function loadFont() {
  return new Promise((resolve, reject) => {
    new FontLoader().load(FONT_URL, resolve, undefined, reject);
  });
}
