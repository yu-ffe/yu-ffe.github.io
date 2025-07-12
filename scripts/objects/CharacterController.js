import * as THREE from "three";

// 상태 텍스처 정의
let idleTexture, moveTexture;
let characterMesh;
let velocity = new THREE.Vector3(0, 0, 0);
const speed = 5;

export async function createCharacter(scene, camera) {
  const loader = new THREE.TextureLoader();

  idleTexture = await loader.loadAsync("./assets/Idle.gif");
  moveTexture = await loader.loadAsync("./assets/Move.gif");

  idleTexture.wrapS = idleTexture.wrapT = THREE.RepeatWrapping;
  moveTexture.wrapS = moveTexture.wrapT = THREE.RepeatWrapping;

  const material = new THREE.MeshBasicMaterial({
    map: idleTexture,
    transparent: true,
    side: THREE.DoubleSide, // 앞뒤 다 보이도록 설정
  });

  const geometry = new THREE.PlaneGeometry(4, 4);
  characterMesh = new THREE.Mesh(geometry, material);
  characterMesh.position.set(0, 2, 0); // Y축으로 띄움
  scene.add(characterMesh);

  setupKeyboardControls(camera);
}

function setupKeyboardControls(camera) {
  const keys = {};

  window.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
  window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

  function updateVelocity() {
    velocity.set(0, 0, 0);

    if (keys["arrowup"] || keys["w"]) velocity.z -= 1;
    if (keys["arrowdown"] || keys["s"]) velocity.z += 1;
    if (keys["arrowleft"] || keys["a"]) velocity.x -= 1;
    if (keys["arrowright"] || keys["d"]) velocity.x += 1;

    velocity.normalize().multiplyScalar(speed);

    if (characterMesh && characterMesh.material) {
      characterMesh.material.map = velocity.length() > 0 ? moveTexture : idleTexture;
    }
  }

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    updateVelocity();

    const delta = clock.getDelta();
    characterMesh.position.add(velocity.clone().multiplyScalar(delta));

    // ✅ 캐릭터가 항상 카메라를 바라보도록
    if (characterMesh && camera) {
      characterMesh.lookAt(camera.position);
    }
  }

  animate();
}
