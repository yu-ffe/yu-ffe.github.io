// 탑방: Blender에서 만든 tower_room.glb(바닥·6면 벽·회랑·계단·책장·장식장·벽돌)를 불러온다.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FOG_COLOR, FOG_FAR, FOG_NEAR } from "../../constants/environment.js";
import { ROOM_SIZE } from "./constants.js";
import { addWindow } from "./window.js";
import meta from "./meta.json";

const SCALE = 3.2; // Blender 1m -> 씬 단위
const ROTATION_Y = THREE.MathUtils.degToRad(55); // 카메라(50,50,50) 쪽으로 열린 면이 향하도록 회전
const BOOK_COLORS = [0xffebe0, 0xffcfd2, 0xf9b4ab, 0xbce6ff, 0xacc3ff, 0xd6e4f5, 0xf2e6b8];

// 사이트 기존 팔레트: 마루 7b5a3c, 벽 e9f1ff, 가구 목재 계열.
const PART_COLORS = {
  Wall: { color: 0xe9f1ff, roughness: 0.7, metalness: 0.06 },
  Gallery: { color: 0x9f7a56, roughness: 0.6, metalness: 0.08 },
  Pillars: { color: 0x9f7a56, roughness: 0.6, metalness: 0.08 },
  GalleryRail: { color: 0xb98761, roughness: 0.55, metalness: 0.08 },
  Stairs: { color: 0xb98761, roughness: 0.55, metalness: 0.08 },
  Bookshelves: { color: 0xcaa77a, roughness: 0.6, metalness: 0.05 },
  Cabinets: { color: 0xb78963, roughness: 0.6, metalness: 0.05 },
  Bricks: { color: 0x8d8176, roughness: 0.85, metalness: 0.02 },
};

export function initializeTowerRoomScene(scene) {
  const roomGroup = new THREE.Group();
  roomGroup.name = "TowerRoom";
  roomGroup.scale.setScalar(SCALE);
  roomGroup.rotation.y = ROTATION_Y;
  roomGroup.position.y = ROOM_SIZE.floorLevel;

  const bookshelfBooks = [];
  const { x: bx, y: by } = meta.bounds;
  const model = new THREE.Group();
  model.position.set(-(bx[0] + bx[1]) / 2, 0, (by[0] + by[1]) / 2);
  roomGroup.add(model);
  scene.add(roomGroup);
  scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);
  roomGroup.updateMatrixWorld(true);

  // Blender(x, y, z) -> three(x, z, -y)
  const toWorld = (x, y, z) => roomGroup.localToWorld(new THREE.Vector3(x, z, -y).add(model.position));
  const win = meta.window;
  const windowDetails = addWindow(scene, {
    width: win.w * SCALE,
    height: win.h * SCALE,
    bottomY: ROOM_SIZE.floorLevel + win.z * SCALE,
  });
  const wp = toWorld(win.x, win.y, win.z);
  const wn = new THREE.Vector3(win.nx, 0, -win.ny).applyAxisAngle(new THREE.Vector3(0, 1, 0), ROTATION_Y);
  windowDetails.group.position.set(wp.x, 0, wp.z);
  windowDetails.group.rotation.y = Math.atan2(wn.x, wn.z);

  const windowLight = new THREE.PointLight(0x7cbcff, 0.72, 36, 1.8);
  windowLight.position.copy(wp).add(wn.clone().multiplyScalar(3)).setY(ROOM_SIZE.floorLevel + 6);
  scene.add(windowLight);
  const lamp = new THREE.PointLight(0xffd6a1, 0.95, 24, 1.4);
  lamp.position.copy(toWorld(0, 3, 2.4));
  scene.add(lamp);

  const ready = new GLTFLoader()
    .loadAsync(`${import.meta.env.BASE_URL}assets/models/tower_room.glb`)
    .then((gltf) => {
      model.add(gltf.scene);
      gltf.scene.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.name === "Floor") {
          obj.material = createFloorMaterial();
          applyPlanarUv(obj.geometry);
        } else if (obj.name.startsWith("Book_")) {
          setupBook(obj, bookshelfBooks);
        } else if (PART_COLORS[obj.name]) {
          obj.material = new THREE.MeshStandardMaterial(PART_COLORS[obj.name]);
        }
      });
    });

  return {
    roomGroup,
    bookshelfBooks,
    windowDetails,
    updateCallbacks: [windowDetails.update],
    ready,
  };
}

function setupBook(book, books) {
  const index = books.length;
  book.geometry.computeBoundingBox();
  const center = book.geometry.boundingBox.getCenter(new THREE.Vector3());
  book.geometry.translate(-center.x, -center.y, -center.z);
  book.position.copy(center);
  book.material = new THREE.MeshStandardMaterial({
    color: BOOK_COLORS[index % BOOK_COLORS.length],
    roughness: 0.42,
    metalness: 0.05,
    emissive: new THREE.Color(0xffe2c5).multiplyScalar(0.05),
  });
  book.userData.isInteractiveBook = false;
  book.userData.link = null;
  book.userData.highlight = {
    originalPosition: book.position.clone(),
    originalColor: book.material.color.clone(),
    originalEmissive: book.material.emissive.clone(),
  };
  books.push(book);
}

// 마루 판자 텍스처(사이트 기존 마루색 0x7b5a3c 기준 톤 변화)
function createFloorMaterial() {
  const size = 512;
  const planks = 8;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const base = new THREE.Color(0x7b5a3c);
  for (let i = 0; i < planks; i += 1) {
    const tone = 0.08 * Math.sin(i * 19.73);
    ctx.fillStyle = `#${base.clone().offsetHSL(0, 0, tone).getHexString()}`;
    ctx.fillRect((i * size) / planks, 0, size / planks, size);
    ctx.fillStyle = "rgba(30,20,12,0.55)";
    ctx.fillRect((i * size) / planks, 0, 2, size);
    for (let k = 0; k < 3; k += 1) {
      ctx.fillRect((i * size) / planks, ((Math.sin(i * 7.1 + k * 3.7) + 1) / 2) * size, size / planks, 1.5);
    }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 4;
  return new THREE.MeshStandardMaterial({ map, roughness: 0.6, metalness: 0.08 });
}

function applyPlanarUv(geometry) {
  const pos = geometry.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i += 1) {
    uv[i * 2] = pos.getX(i) / 10;
    uv[i * 2 + 1] = pos.getZ(i) / 10;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}
