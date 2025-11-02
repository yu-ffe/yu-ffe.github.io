import * as THREE from "three";

const IMAGE_PLANES = [
  {
    texture: "./image/else/62f9297e-48f1-422a-a234-e57aa98763d2.png",
    size: [10, 10],
    position: [0, 5, 0],
  },
  {
    texture: "./image/else/62f9297e-48f1-422a-a234-e57aa98763d3.png",
    size: [10, 10],
    position: [10, 5, 0],
  },
];

export function addImagePlanes(scene) {
  const loader = new THREE.TextureLoader();

  IMAGE_PLANES.forEach(({ texture, size, position }) => {
    loader.load(texture, (map) => {
      map.colorSpace = THREE.SRGBColorSpace;

      const geometry = new THREE.PlaneGeometry(size[0], size[1]);
      const material = new THREE.MeshBasicMaterial({ map, transparent: true });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(...position);
      scene.add(plane);
    });
  });
}
