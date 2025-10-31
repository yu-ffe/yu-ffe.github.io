import * as THREE from "three";

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

export function registerClickHandler({ camera, scene, onNavigate = openLink }) {
  window.addEventListener("click", (event) => {
    updatePointerFromEvent(event);
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length === 0) {
      return;
    }

    const { object } = intersects[0];
    const link = object?.userData?.link;
    if (link) {
      onNavigate(link);
    }
  });
}

function updatePointerFromEvent(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function openLink(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}
