// Stream_LiveGame :: 위아래로 여닫을 수 있는 창문 상호작용을 관리한다.
import * as THREE from "three";

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

export function setupWindowInteractions(camera, windowDetails) {
  const interactionTarget = windowDetails?.interactionTarget;
  const toggle = windowDetails?.toggle;
  const highlightMaterials = Array.isArray(windowDetails?.highlightMaterials)
    ? windowDetails.highlightMaterials
    : [];

  if (!camera || !interactionTarget || typeof toggle !== "function") {
    return () => {};
  }

  const materialStates = highlightMaterials.map((material) => ({
    material,
    baseOpacity: material?.opacity ?? 1,
  }));

  let isHovering = false;

  function updatePointer(clientX, clientY) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  }

  function intersectWindow() {
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObject(interactionTarget, true)[0];
  }

  function setHover(state) {
    if (isHovering === state) {
      return;
    }

    isHovering = state;

    if (isHovering) {
      document.body.style.cursor = "pointer";
      materialStates.forEach(({ material, baseOpacity }) => {
        if (!material) {
          return;
        }
        material.opacity = Math.min(1, baseOpacity + 0.18);
        material.needsUpdate = true;
      });
    } else if (document.body.style.cursor === "pointer") {
      document.body.style.cursor = "";
      materialStates.forEach(({ material, baseOpacity }) => {
        if (!material) {
          return;
        }
        material.opacity = baseOpacity;
        material.needsUpdate = true;
      });
    }
  }

  function handlePointerMove(event) {
    updatePointer(event.clientX, event.clientY);
    setHover(Boolean(intersectWindow()));
  }

  function handlePointerOut(event) {
    if (!event.relatedTarget || !(event.relatedTarget instanceof Element)) {
      setHover(false);
    }
  }

  function handleBlur() {
    setHover(false);
  }

  function handleClick(event) {
    updatePointer(event.clientX, event.clientY);
    if (intersectWindow()) {
      toggle();
    }
  }

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerout", handlePointerOut);
  window.addEventListener("blur", handleBlur);
  window.addEventListener("click", handleClick);

  return () => {
    setHover(false);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerout", handlePointerOut);
    window.removeEventListener("blur", handleBlur);
    window.removeEventListener("click", handleClick);
  };
}
