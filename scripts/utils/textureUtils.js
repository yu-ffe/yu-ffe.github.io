import * as THREE from "three";

export function loadTexture({
  url,
  repeat = [1, 1],
  rotation = 0,
  center = [0.5, 0.5],
  colorSpace = null,
}, loader = new THREE.TextureLoader()) {
  const texture = loader.load(url);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.center.set(...center);
  texture.rotation = rotation;

  const resolvedColorSpace = resolveColorSpace(colorSpace);
  if (resolvedColorSpace) {
    texture.colorSpace = resolvedColorSpace;
  }

  return texture;
}

export function loadTextureSet(config) {
  const loader = new THREE.TextureLoader();
  return Object.fromEntries(
    Object.entries(config).map(([key, options]) => [key, loadTexture(options, loader)])
  );
}

function resolveColorSpace(value) {
  if (!value) {
    return null;
  }

  if (value === "SRGB") {
    return THREE.SRGBColorSpace;
  }

  return value;
}
