import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const DEFAULT_TEXT_URL = "data/texts.json";
const FONT_URL = "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json";

export async function loadTexts(scene, camera, url = DEFAULT_TEXT_URL) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch text data: ${response.status}`);
    }

    const texts = await response.json();
    const font = await loadFont(FONT_URL);

    texts.forEach((textData) => {
      const { x, y, z, text, link } = textData;
      const textMesh = createTextMesh(font, text);
      textMesh.position.set(x, y, z);
      textMesh.userData.link = link;
      textMesh.lookAt(camera.position);
      scene.add(textMesh);
    });
  } catch (error) {
    console.error("[loadTexts]", error);
  }
}

function createTextMesh(font, text) {
  const textGeometry = new TextGeometry(text, {
    font,
    size: 0.4,
    height: 1,
  });

  textGeometry.center();
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  return new THREE.Mesh(textGeometry, material);
}

function loadFont(url) {
  return new Promise((resolve, reject) => {
    const loader = new FontLoader();
    loader.load(url, resolve, undefined, reject);
  });
}
