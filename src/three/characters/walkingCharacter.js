// 이전 모델 A(Blender Character_Base → model_a.glb)를 방 안에 세우고 걸어다니게 한다.
// 이동: WASD / 방향키(카메라 기준), 바닥·계단·회랑 클릭(그 위치로 걷기).
// 충돌: 방 glb 의 벽·가구·기둥·난간은 가로 레이로 막고, 바닥·회랑·계단은 아래로 레이를 쏴 발 높이를 구한다(계단 오르내리기).
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const UNIT = 3.0; // 방 glb 1m -> 씬 단위 (tower-room/index.js 의 SCALE 과 같다)
const HEIGHT_M = 1.7; // 캐릭터 키(m)
const RADIUS = 0.3 * UNIT;
const SPEED = 2.2 * UNIT; // 걷는 속도(씬 단위/초)
const STEP_UP = 0.45 * UNIT;
const MAX_DROP = 0.7 * UNIT;
const BODY_RAY_HEIGHTS = [0.4 * UNIT, 1.0 * UNIT];
const WALKABLE = new Set(["Floor", "Gallery", "Stairs"]);
const BLOCKERS = new Set(["Wall", "Pillars", "GalleryRail", "Bookshelves", "Cabinets", "Bricks"]);
const SKIN = { color: 0xf0cdb8, roughness: 0.55, metalness: 0.0 };

const UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);

export async function createWalkingCharacter({ scene, camera, canvas, roomGroup }) {
  roomGroup.updateMatrixWorld(true);
  const walkMeshes = [];
  const blockMeshes = [];
  roomGroup.traverse((obj) => {
    if (!obj.isMesh) return;
    if (WALKABLE.has(obj.name)) walkMeshes.push(obj);
    if (BLOCKERS.has(obj.name)) blockMeshes.push(obj);
  });
  if (!walkMeshes.length) throw new Error("walkable meshes not found");

  const raycaster = new THREE.Raycaster();

  // ---- 모델 불러오기 -------------------------------------------------------
  const gltf = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}assets/models/model_a.glb`);
  const model = gltf.scene;
  const material = new THREE.MeshStandardMaterial(SKIN);
  const nodes = {};
  model.traverse((obj) => {
    nodes[obj.name] = obj;
    if (obj.isMesh) {
      obj.material = material;
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  const box = new THREE.Box3().setFromObject(model);
  const scale = (HEIGHT_M * UNIT) / (box.max.y - box.min.y);
  model.scale.setScalar(scale);
  model.position.y = -box.min.y * scale; // 발바닥이 y=0
  const root = new THREE.Group();
  root.name = "ModelA";
  root.add(model);
  scene.add(root);

  // 걷기 애니메이션에 쓰는 관절(원점이 관절 위치라서 회전만 주면 된다)
  const rig = {
    thighL: nodes.Thigh_L, thighR: nodes.Thigh_R, kneeL: nodes.Knee_L, kneeR: nodes.Knee_R,
    armL: nodes.UpperArm_L, armR: nodes.UpperArm_R, elbowL: nodes.Elbow_L, elbowR: nodes.Elbow_R,
    pelvis: nodes.Pelvis, head: nodes.Head,
  };
  const base = {};
  Object.entries(rig).forEach(([k, n]) => { if (n) base[k] = { x: n.rotation.x, y: n.rotation.y, py: n.position.y }; });

  // ---- 충돌/지면 -----------------------------------------------------------
  const groundY = (x, z, fromY) => {
    raycaster.set(new THREE.Vector3(x, fromY + STEP_UP, z), DOWN);
    raycaster.far = STEP_UP + MAX_DROP + 0.5;
    const hit = raycaster.intersectObjects(walkMeshes, false)[0];
    return hit ? hit.point.y : null;
  };
  const blockedToward = (pos, dir, dist) => {
    const dirs = [dir, dir.clone().applyAxisAngle(UP, 0.6), dir.clone().applyAxisAngle(UP, -0.6)];
    for (const h of BODY_RAY_HEIGHTS) {
      for (const d of dirs) {
        raycaster.set(new THREE.Vector3(pos.x, pos.y + h, pos.z), d);
        raycaster.far = dist + RADIUS;
        if (raycaster.intersectObjects(blockMeshes, false).length) return true;
      }
    }
    return false;
  };
  const tryStep = (pos, step) => {
    const dist = step.length();
    if (dist < 1e-6) return false;
    const dir = step.clone().divideScalar(dist);
    if (blockedToward(pos, dir, dist)) return false;
    const nx = pos.x + step.x;
    const nz = pos.z + step.z;
    const gy = groundY(nx, nz, pos.y);
    if (gy === null || gy - pos.y > STEP_UP || pos.y - gy > MAX_DROP) return false;
    pos.set(nx, gy, nz);
    return true;
  };
  const move = (pos, step) => {
    if (tryStep(pos, step)) return true;
    // 벽을 따라 미끄러지기: 축별로 나눠 시도
    const a = new THREE.Vector3(step.x, 0, 0);
    const b = new THREE.Vector3(0, 0, step.z);
    const first = Math.abs(step.x) > Math.abs(step.z) ? [a, b] : [b, a];
    return tryStep(pos, first[0]) || tryStep(pos, first[1]);
  };

  // ---- 시작 위치: 방 가운데에서 가장 가까운 빈 바닥 --------------------------
  const floor = walkMeshes.find((m) => m.name === "Floor") ?? walkMeshes[0];
  const fbox = new THREE.Box3().setFromObject(floor);
  const center = fbox.getCenter(new THREE.Vector3());
  const spawn = new THREE.Vector3(center.x, fbox.max.y, center.z);
  outer: for (let r = 0; r < 20 * UNIT; r += 0.5 * UNIT) {
    for (let k = 0; k < Math.max(1, Math.round(r / UNIT * 8)); k += 1) {
      const ang = (k / Math.max(1, Math.round(r / UNIT * 8))) * Math.PI * 2;
      const x = center.x + Math.cos(ang) * r;
      const z = center.z + Math.sin(ang) * r;
      const gy = groundY(x, z, fbox.max.y);
      if (gy === null) continue;
      const p = new THREE.Vector3(x, gy, z);
      let free = true;
      for (let t = 0; t < 8 && free; t += 1) {
        const d = new THREE.Vector3(Math.cos((t / 8) * Math.PI * 2), 0, Math.sin((t / 8) * Math.PI * 2));
        free = !blockedToward(p, d, 0.2 * UNIT);
      }
      if (free) { spawn.copy(p); break outer; }
    }
  }
  root.position.copy(spawn);

  // ---- 입력 ---------------------------------------------------------------
  const keys = new Set();
  let target = null; // 클릭 이동 목표
  const KEYMAP = { KeyW: "f", ArrowUp: "f", KeyS: "b", ArrowDown: "b", KeyA: "l", ArrowLeft: "l", KeyD: "r", ArrowRight: "r" };
  const onKeyDown = (e) => {
    if (e.target && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
    const k = KEYMAP[e.code];
    if (!k) return;
    keys.add(k);
    target = null;
    e.preventDefault();
  };
  const onKeyUp = (e) => { const k = KEYMAP[e.code]; if (k) keys.delete(k); };
  const onBlur = () => keys.clear();

  const ndc = new THREE.Vector2();
  let down = null;
  const onPointerDown = (e) => { down = { x: e.clientX, y: e.clientY, button: e.button }; };
  const onPointerUp = (e) => {
    if (!down || down.button !== 0 || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down = null; return; }
    down = null;
    ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    raycaster.far = Infinity;
    const first = raycaster.intersectObjects(scene.children, true)[0];
    if (first?.object?.userData?.link) return; // 책 링크 등 기존 클릭 동작은 건드리지 않는다
    const hit = raycaster.intersectObjects(walkMeshes, false)[0];
    if (hit) target = hit.point.clone();
  };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);

  // 안내 문구
  const hint = document.createElement("div");
  hint.textContent = "WASD / 방향키로 걷기 · 바닥 클릭으로 이동";
  Object.assign(hint.style, {
    position: "fixed", left: "50%", bottom: "14px", transform: "translateX(-50%)", padding: "6px 12px",
    font: "13px/1.2 system-ui, sans-serif", color: "#e9f1ff", background: "rgba(21,35,54,0.72)", borderRadius: "8px",
    pointerEvents: "none", transition: "opacity 1.2s", opacity: "1", zIndex: "5",
  });
  document.body.appendChild(hint);
  const hintTimer = setTimeout(() => { hint.style.opacity = "0"; }, 6000);

  // ---- 프레임 갱신 ----------------------------------------------------------
  const fwd = new THREE.Vector3();
  const right = new THREE.Vector3();
  const wish = new THREE.Vector3();
  let phase = 0;
  let moving = 0; // 0~1 걷는 정도(애니메이션 섞기)
  let yaw = 0;
  const lerpAngle = (a, b, t) => {
    let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
  };

  const update = (delta) => {
    const dt = Math.min(delta, 0.05);
    camera.getWorldDirection(fwd);
    fwd.y = 0;
    if (fwd.lengthSq() < 1e-6) fwd.set(-1, 0, -1);
    fwd.normalize();
    right.set(-fwd.z, 0, fwd.x);

    wish.set(0, 0, 0);
    if (keys.has("f")) wish.add(fwd);
    if (keys.has("b")) wish.sub(fwd);
    if (keys.has("r")) wish.add(right);
    if (keys.has("l")) wish.sub(right);
    if (wish.lengthSq() === 0 && target) {
      wish.set(target.x - root.position.x, 0, target.z - root.position.z);
      if (wish.length() < 0.25 * UNIT) { target = null; wish.set(0, 0, 0); }
    }

    let walked = false;
    if (wish.lengthSq() > 1e-6) {
      wish.normalize();
      const step = wish.clone().multiplyScalar(SPEED * dt);
      walked = move(root.position, step);
      yaw = lerpAngle(yaw, Math.atan2(wish.x, wish.z), Math.min(1, dt * 14));
      if (!walked && target) target = null; // 막히면 클릭 이동 취소
    }
    root.rotation.y = yaw;

    moving += ((walked ? 1 : 0) - moving) * Math.min(1, dt * 10);
    if (walked) phase += dt * 9.5;
    const s = Math.sin(phase);
    const idle = Math.sin(performance.now() / 900) * 0.012;
    const set = (key, x, extra = {}) => { const n = rig[key]; if (n) { n.rotation.x = base[key].x + x; Object.assign(n.position, extra); } };
    set("thighL", -s * 0.62 * moving);
    set("thighR", s * 0.62 * moving);
    set("kneeL", Math.max(0, s) * 0.75 * moving);
    set("kneeR", Math.max(0, -s) * 0.75 * moving);
    set("armL", s * 0.5 * moving + idle);
    set("armR", -s * 0.5 * moving - idle);
    set("elbowL", -(0.1 + 0.3 * Math.max(0, -s)) * moving);
    set("elbowR", -(0.1 + 0.3 * Math.max(0, s)) * moving);
    model.position.y = -box.min.y * scale + Math.abs(Math.sin(phase)) * 0.035 * UNIT * moving;
  };

  const dispose = () => {
    clearTimeout(hintTimer);
    hint.remove();
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    scene.remove(root);
    material.dispose();
    model.traverse((o) => o.isMesh && o.geometry.dispose());
  };

  return { root, update, dispose, moveTo: (point) => { target = point.clone(); }, keys };
}
