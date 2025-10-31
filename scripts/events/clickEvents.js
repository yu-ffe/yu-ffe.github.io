import * as THREE from "three";

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

export function registerClickHandler(camera, scene) {
  window.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    const [firstHit] = intersects;
    if (firstHit && firstHit.object?.userData?.link) {
      window.open(firstHit.object.userData.link, "_blank");
    }
  });
}
