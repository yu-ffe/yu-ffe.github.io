import * as THREE from "three";
import { CSG } from "../libs/esm/CSG.js";

const WALL_TEXTURES = {
  map: "../../image/Material/Wallpaper/Wallpaper001A_1K-PNG_Color.png",
  normalMap: "../../image/Material/Wallpaper/Wallpaper001A_1K-PNG_NormalGL.png",
  roughnessMap: "../../image/Material/Wallpaper/Wallpaper001A_1K-PNG_Roughness.png",
};

const WALL_SIZE = new THREE.Vector3(20, 14, 0.5);
const WINDOW_SIZE = new THREE.Vector3(5, 5, 1);

export function createWalls(scene) {
  const { wallpaperMaterial, accentMaterial } = createMaterials();

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(WALL_SIZE.x, WALL_SIZE.y, WALL_SIZE.z),
    [accentMaterial, accentMaterial, accentMaterial, wallpaperMaterial, wallpaperMaterial, wallpaperMaterial]
  );
  leftWall.position.set(-9.75, 0.35, 0);
  leftWall.rotation.y = Math.PI / 2;
  scene.add(leftWall);

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(WALL_SIZE.x, WALL_SIZE.y, WALL_SIZE.z),
    [
      accentMaterial,
      wallpaperMaterial,
      accentMaterial,
      wallpaperMaterial,
      wallpaperMaterial,
      wallpaperMaterial,
    ]
  );

  const windowHole = new THREE.Mesh(new THREE.BoxGeometry(WINDOW_SIZE.x, WINDOW_SIZE.y, WINDOW_SIZE.z));
  windowHole.position.set(-4, 1, 0);
  windowHole.updateMatrix();

  const backWallWithWindow = CSG.toMesh(
    CSG.fromMesh(backWall).subtract(CSG.fromMesh(windowHole)),
    backWall.matrix,
    backWall.material
  );

  backWallWithWindow.position.set(0, 0.35, -9.75);
  scene.add(backWallWithWindow);

  addWindowFrame(scene);
}

function createMaterials() {
  const loader = new THREE.TextureLoader();
  const textures = Object.entries(WALL_TEXTURES).reduce((acc, [key, path]) => {
    const texture = loader.load(path);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    if (key === "map") {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    acc[key] = texture;
    return acc;
  }, {});

  const wallpaperMaterial = new THREE.MeshStandardMaterial({
    map: textures.map,
    normalMap: textures.normalMap,
    roughnessMap: textures.roughnessMap,
    roughness: 1.0,
    side: THREE.DoubleSide,
    color: new THREE.Color(0xaa8b66),
  });

  const accentMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x200f08),
    side: THREE.DoubleSide,
  });

  return { wallpaperMaterial, accentMaterial };
}

function addWindowFrame(scene) {
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.6,
    roughness: 0.3,
  });

  const frameDepth = 0.2;
  const frameWidth = 0.35;

  const verticalFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameWidth, 6, frameDepth),
    frameMaterial
  );
  verticalFrame.position.set(-4, 1, -9.7);
  scene.add(verticalFrame);

  const horizontalFrame = new THREE.Mesh(
    new THREE.BoxGeometry(6, frameWidth, frameDepth),
    frameMaterial
  );
  horizontalFrame.position.set(-4, 1.4, -9.7);
  scene.add(horizontalFrame);
}
