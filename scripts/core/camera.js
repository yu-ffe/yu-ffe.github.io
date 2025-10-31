import * as THREE from "three";

export function createOrthographicCamera({
  frustumSize,
  aspect,
  near = 0.1,
  far = 1000,
  position = new THREE.Vector3(50, 50, 50),
  lookAt = new THREE.Vector3(0, 0, 0),
}) {
  const camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    near,
    far
  );

  camera.position.copy(position);
  camera.lookAt(lookAt);
  return camera;
}

export function configureResponsiveCamera({ camera, renderer, frustumSize }) {
  function updateProjection() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    camera.left = (frustumSize * aspect) / -2;
    camera.right = (frustumSize * aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;

    camera.zoom = aspect < 1 ? 0.6 : 1.0;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  updateProjection();
  window.addEventListener("resize", updateProjection);
}
