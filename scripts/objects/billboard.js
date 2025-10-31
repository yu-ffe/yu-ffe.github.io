import * as THREE from "three";

export function createBillboards(scene, configs) {
  if (!Array.isArray(configs) || configs.length === 0) {
    return;
  }

  const loader = new THREE.TextureLoader();

  configs.forEach(({ url, size = [10, 10], position = [0, 0, 0], rotation = [0, 0, 0] }) => {
    loader.load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const [width, height] = size;
      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(...position);
      plane.rotation.set(...rotation);
      scene.add(plane);
    });
  });
}
