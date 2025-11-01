import * as THREE from "three";

export const ROOM_DIMENSIONS = Object.freeze({
  width: 20,
  depth: 18,
  height: 18,
  floorY: -7,
});

const WALL_THICKNESS = 0.45;

export function createCornerShell(scene) {
  const { width, depth, height, floorY } = ROOM_DIMENSIONS;

  const wallpaperTexture = createWallpaperTexture();
  wallpaperTexture.wrapS = THREE.RepeatWrapping;
  wallpaperTexture.wrapT = THREE.RepeatWrapping;
  wallpaperTexture.repeat.set(2, 2);
  wallpaperTexture.colorSpace = THREE.SRGBColorSpace;
  wallpaperTexture.anisotropy = 8;

  const wallpaperMaterial = new THREE.MeshStandardMaterial({
    map: wallpaperTexture,
    color: 0x1c3444,
    roughness: 0.82,
    metalness: 0.12,
  });

  const panelTexture = createPanelTexture();
  panelTexture.wrapS = THREE.RepeatWrapping;
  panelTexture.wrapT = THREE.RepeatWrapping;
  panelTexture.repeat.set(3, 2);
  panelTexture.colorSpace = THREE.SRGBColorSpace;
  panelTexture.anisotropy = 8;

  const panelMaterial = new THREE.MeshStandardMaterial({
    map: panelTexture,
    color: 0x130a1c,
    roughness: 0.9,
    metalness: 0.08,
  });

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(WALL_THICKNESS, height, depth),
    wallpaperMaterial
  );
  leftWall.position.set(-width / 2, floorY + height / 2, 0);
  leftWall.castShadow = false;
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, WALL_THICKNESS),
    panelMaterial
  );
  rightWall.position.set(0, floorY + height / 2, -depth / 2);
  rightWall.castShadow = false;
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  const baseboardMaterial = new THREE.MeshStandardMaterial({
    color: 0x0c0a10,
    roughness: 0.35,
    metalness: 0.35,
  });

  const baseboardHeight = 0.6;
  const baseboardDepth = 0.3;

  const leftBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(baseboardDepth, baseboardHeight, depth),
    baseboardMaterial
  );
  leftBaseboard.position.set(
    -width / 2 + baseboardDepth / 2,
    floorY + baseboardHeight / 2,
    0
  );
  scene.add(leftBaseboard);

  const rightBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(width, baseboardHeight, baseboardDepth),
    baseboardMaterial
  );
  rightBaseboard.position.set(
    0,
    floorY + baseboardHeight / 2,
    -depth / 2 + baseboardDepth / 2
  );
  scene.add(rightBaseboard);

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x05070c,
    roughness: 0.92,
    metalness: 0.05,
  });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    floorMaterial
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = floorY;
  floor.receiveShadow = true;
  scene.add(floor);

  const floorInlay = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.74, depth * 0.46),
    new THREE.MeshStandardMaterial({
      color: 0x0d1a27,
      roughness: 0.6,
      metalness: 0.18,
    })
  );
  floorInlay.rotation.x = -Math.PI / 2;
  floorInlay.rotation.z = Math.PI / 9;
  floorInlay.position.set(-0.3, floorY + 0.03, -1.8);
  floorInlay.receiveShadow = true;
  scene.add(floorInlay);
}

export function createCarpet(scene) {
  const { floorY } = ROOM_DIMENSIONS;
  const carpetTexture = createCarpetTexture();
  carpetTexture.colorSpace = THREE.SRGBColorSpace;
  carpetTexture.anisotropy = 8;

  const carpet = new THREE.Mesh(
    new THREE.PlaneGeometry(9.6, 13.2),
    new THREE.MeshStandardMaterial({
      map: carpetTexture,
      roughness: 0.9,
      metalness: 0.08,
      transparent: true,
      side: THREE.DoubleSide,
    })
  );
  carpet.rotation.x = -Math.PI / 2;
  carpet.rotation.z = Math.PI / 7;
  carpet.position.set(-0.5, floorY + 0.04, -2.3);
  carpet.receiveShadow = true;
  scene.add(carpet);
}

export function createPictureFrames(scene) {
  const { width, floorY } = ROOM_DIMENSIONS;
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xf26b7d,
    metalness: 0.25,
    roughness: 0.4,
  });

  const artMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d2235,
    emissive: 0x123b50,
    emissiveIntensity: 0.35,
  });

  const frameData = [
    { size: [3.4, 3.8], position: new THREE.Vector3(0, floorY + 8.2, -2.8) },
    { size: [2.7, 3], position: new THREE.Vector3(0, floorY + 5.6, 1.6) },
    { size: [2.1, 3.4], position: new THREE.Vector3(0, floorY + 10.4, 3.3) },
    { size: [1.6, 2.2], position: new THREE.Vector3(0, floorY + 4.2, -4.4) },
  ];

  frameData.forEach(({ size, position }) => {
    const [w, h] = size;
    const frameDepth = 0.35;

    const group = new THREE.Group();

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.3, h + 0.3, frameDepth),
      frameMaterial
    );
    frame.castShadow = true;
    frame.receiveShadow = true;
    group.add(frame);

    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      artMaterial.clone()
    );
    art.position.z = frameDepth / 2 + 0.02;
    art.castShadow = false;
    art.receiveShadow = false;
    group.add(art);

    group.position.copy(position);
    group.position.x = -width / 2 + 0.25;
    group.rotation.y = Math.PI / 2;

    scene.add(group);
  });
}

export function createBookshelf(scene) {
  const { depth, floorY } = ROOM_DIMENSIONS;
  const shelfWidth = 7.5;
  const shelfHeight = 9;
  const shelfDepth = 1.2;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x132233,
    roughness: 0.6,
    metalness: 0.2,
  });

  const shelfGroup = new THREE.Group();

  const sideGeometry = new THREE.BoxGeometry(0.35, shelfHeight, shelfDepth);
  const leftSide = new THREE.Mesh(sideGeometry, frameMaterial);
  leftSide.position.set(-shelfWidth / 2 + 0.175, 0, 0);
  leftSide.castShadow = true;
  shelfGroup.add(leftSide);

  const rightSide = leftSide.clone();
  rightSide.position.x = shelfWidth / 2 - 0.175;
  shelfGroup.add(rightSide);

  const topBottomGeometry = new THREE.BoxGeometry(shelfWidth - 0.35, 0.3, shelfDepth);
  const topPanel = new THREE.Mesh(topBottomGeometry, frameMaterial);
  topPanel.position.set(0, shelfHeight / 2 - 0.15, 0);
  topPanel.castShadow = true;
  shelfGroup.add(topPanel);

  const bottomPanel = topPanel.clone();
  bottomPanel.position.y = -shelfHeight / 2 + 0.15;
  shelfGroup.add(bottomPanel);

  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: 0x193247,
    roughness: 0.75,
    metalness: 0.1,
  });

  const shelfLevels = 4;
  const shelfGeometry = new THREE.BoxGeometry(shelfWidth - 0.4, 0.2, shelfDepth - 0.1);
  for (let i = 1; i <= shelfLevels; i += 1) {
    const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.y = -shelfHeight / 2 + (i * shelfHeight) / (shelfLevels + 1);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    shelfGroup.add(shelf);
  }

  const bookColors = [0xff4f6a, 0x8ef5c0, 0x59c9c6, 0xf1f2f6];
  const bookGeometry = new THREE.BoxGeometry(0.35, 1, 0.8);
  for (let row = 0; row < shelfLevels; row += 1) {
    const booksInRow = 9;
    for (let i = 0; i < booksInRow; i += 1) {
      const height = 1.2 + Math.random() * 2.2;
      const book = new THREE.Mesh(
        bookGeometry.clone(),
        new THREE.MeshStandardMaterial({
          color: bookColors[(row * booksInRow + i) % bookColors.length],
          roughness: 0.5,
          metalness: 0.1,
        })
      );
      book.scale.y = height;
      book.position.set(
        -shelfWidth / 2 + 0.6 + i * 0.7,
        -shelfHeight / 2 + (row + 1) * (shelfHeight / (shelfLevels + 1)) + height * 0.5,
        -0.05 + Math.random() * 0.1
      );
      book.castShadow = true;
      shelfGroup.add(book);
    }
  }

  shelfGroup.position.set(3.4, floorY + shelfHeight / 2 + 0.2, -depth / 2 + shelfDepth / 2 + 0.6);
  scene.add(shelfGroup);
}

export function createFloatingShelves(scene) {
  const { depth, floorY, height } = ROOM_DIMENSIONS;

  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: 0x142234,
    roughness: 0.6,
    metalness: 0.2,
  });

  const boardGeometry = new THREE.BoxGeometry(4.5, 0.25, 0.7);
  const offsets = [0, 2.2, 4.4];

  offsets.forEach((offset, index) => {
    const board = new THREE.Mesh(boardGeometry, shelfMaterial);
    board.position.set(
      5.8,
      floorY + height - 4.3 - offset,
      -depth / 2 + 0.9
    );
    board.castShadow = true;
    board.receiveShadow = true;
    scene.add(board);

    const decorGroup = new THREE.Group();
    decorGroup.position.copy(board.position);
    decorGroup.position.y += 0.4;
    decorGroup.position.z += 0.25;

    const vase = createVase(index);
    vase.position.set(-1, 0, 0);
    decorGroup.add(vase);

    const stack = createBookStack(index);
    stack.position.set(1.1, 0, 0.1);
    decorGroup.add(stack);

    scene.add(decorGroup);
  });
}

export function createAccentTable(scene) {
  const { floorY } = ROOM_DIMENSIONS;

  const tableMaterial = new THREE.MeshStandardMaterial({
    color: 0x38152c,
    roughness: 0.45,
    metalness: 0.32,
  });

  const tabletop = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.6, 0.28, 28),
    tableMaterial
  );
  tabletop.position.set(-0.3, floorY + 1.05, -1.6);
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  scene.add(tabletop);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.9, 1.15, 24),
    tableMaterial
  );
  pedestal.position.set(-0.3, floorY + 0.58, -1.6);
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  scene.add(pedestal);

  const glassTop = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.16, 28),
    new THREE.MeshPhysicalMaterial({
      color: 0x96f5de,
      metalness: 0.15,
      roughness: 0.08,
      transmission: 0.78,
      thickness: 0.25,
      opacity: 0.95,
    })
  );
  glassTop.position.set(-0.3, floorY + 1.24, -1.6);
  glassTop.castShadow = true;
  scene.add(glassTop);

  const lampGroup = new THREE.Group();
  lampGroup.position.set(-0.3, floorY + 1.44, -1.6);

  const lampBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.32, 0.35, 20),
    new THREE.MeshStandardMaterial({ color: 0x13263a, roughness: 0.4, metalness: 0.3 })
  );
  lampBase.castShadow = true;
  lampBase.receiveShadow = true;
  lampGroup.add(lampBase);

  const lampShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.6, 0.8, 24, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xf6d7b0,
      emissive: 0xf7cfa2,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.9,
    })
  );
  lampShade.position.y = 0.75;
  lampGroup.add(lampShade);

  const lightBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xfff1c1,
      emissive: 0xffe9b5,
      emissiveIntensity: 1.4,
    })
  );
  lightBulb.position.y = 0.3;
  lampGroup.add(lightBulb);

  scene.add(lampGroup);
}

export function createChandelier(scene) {
  const { floorY, height } = ROOM_DIMENSIONS;

  const chandelierGroup = new THREE.Group();
  chandelierGroup.position.set(-0.8, floorY + height - 2.4, -2);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.08, 16, 56),
    new THREE.MeshStandardMaterial({ color: 0xf6d4a4, metalness: 0.62, roughness: 0.28 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.castShadow = true;
  chandelierGroup.add(ring);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.22, 2.6, 16),
    new THREE.MeshStandardMaterial({ color: 0xf2c78d, metalness: 0.55, roughness: 0.32 })
  );
  stem.position.y = 1.5;
  chandelierGroup.add(stem);

  const ceilingCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.58, 0.35, 18),
    new THREE.MeshStandardMaterial({ color: 0xf2c995, metalness: 0.58, roughness: 0.33 })
  );
  ceilingCap.position.y = 2.5;
  chandelierGroup.add(ceilingCap);

  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2;
    const pendant = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfff3c9,
        emissive: 0xffe8b8,
        emissiveIntensity: 1.7,
        transparent: true,
        opacity: 0.95,
      })
    );
    pendant.position.set(Math.cos(angle) * 1.35, -0.6, Math.sin(angle) * 1.35);
    chandelierGroup.add(pendant);
  }

  scene.add(chandelierGroup);
}

export function createFeatureDivider(scene) {
  const { width, depth, height, floorY } = ROOM_DIMENSIONS;

  const dividerMaterial = new THREE.MeshStandardMaterial({
    color: 0x101b29,
    roughness: 0.6,
    metalness: 0.2,
  });

  const divider = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, height * 0.72, depth * 0.32),
    dividerMaterial
  );
  divider.position.set(-width * 0.18, floorY + height * 0.36, -depth * 0.28);
  divider.rotation.y = Math.PI / 7;
  divider.castShadow = true;
  divider.receiveShadow = true;
  scene.add(divider);

  const glassPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(depth * 0.29, height * 0.46),
    new THREE.MeshPhysicalMaterial({
      color: 0x7ff2df,
      metalness: 0.08,
      roughness: 0.05,
      transmission: 0.88,
      thickness: 0.4,
      opacity: 0.9,
    })
  );
  glassPanel.position.set(-width * 0.18 + 0.18, floorY + height * 0.6, -depth * 0.28);
  glassPanel.rotation.y = Math.PI / 7;
  glassPanel.castShadow = true;
  scene.add(glassPanel);

  const artGroup = new THREE.Group();
  artGroup.position.set(-width * 0.24, floorY, -depth * 0.42);

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.9, 0.6, 24),
    new THREE.MeshStandardMaterial({
      color: 0x130a1c,
      roughness: 0.45,
      metalness: 0.25,
    })
  );
  plinth.position.y = 0.3;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  artGroup.add(plinth);

  const sculpture = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.55, 0.16, 110, 24),
    new THREE.MeshStandardMaterial({
      color: 0xffb0c6,
      metalness: 0.7,
      roughness: 0.25,
      emissive: 0x52283c,
      emissiveIntensity: 0.2,
    })
  );
  sculpture.position.y = 0.95;
  sculpture.rotation.y = Math.PI / 3;
  sculpture.castShadow = true;
  artGroup.add(sculpture);

  scene.add(artGroup);
}

export function createCeilingCove(scene) {
  const { width, depth, height, floorY } = ROOM_DIMENSIONS;

  const coveGroup = new THREE.Group();
  coveGroup.position.y = floorY + height - 0.6;

  const coveMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b111a,
    roughness: 0.4,
    metalness: 0.35,
  });

  const segments = [
    { size: [width - 0.6, 0.28, 0.4], position: [0.15, 0, -depth / 2 + 0.18] },
    { size: [0.4, 0.28, depth - 0.7], position: [-width / 2 + 0.18, 0, 0.1] },
    {
      size: [width * 0.54, 0.24, 0.35],
      position: [-width * 0.05, 0, depth * 0.08],
      rotationY: Math.PI / 7,
    },
  ];

  segments.forEach(({ size, position, rotationY }) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(...size), coveMaterial);
    beam.position.set(...position);
    if (rotationY) {
      beam.rotation.y = rotationY;
    }
    beam.castShadow = false;
    beam.receiveShadow = false;
    coveGroup.add(beam);
  });

  const diffuser = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.48, 0.16, 0.28),
    new THREE.MeshStandardMaterial({
      color: 0x13283a,
      emissive: 0x42e9cd,
      emissiveIntensity: 0.7,
      metalness: 0.25,
      roughness: 0.15,
    })
  );
  diffuser.position.set(-width * 0.05, -0.12, -depth * 0.03);
  diffuser.rotation.y = Math.PI / 7;
  coveGroup.add(diffuser);

  const rib = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 3.6, 16),
    new THREE.MeshStandardMaterial({ color: 0x0d1521, metalness: 0.4, roughness: 0.4 })
  );
  rib.rotation.z = Math.PI / 2;
  rib.position.set(-width * 0.22, -0.16, -depth * 0.35);
  coveGroup.add(rib);

  scene.add(coveGroup);
}

export function createWindowBench(scene) {
  const { depth, floorY } = ROOM_DIMENSIONS;

  const benchGroup = new THREE.Group();
  benchGroup.position.set(-2.3, floorY, -depth / 2 + 1.05);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.6, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x162732, roughness: 0.55, metalness: 0.18 })
  );
  base.position.y = 0.3;
  base.castShadow = true;
  base.receiveShadow = true;
  benchGroup.add(base);

  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(6.7, 0.18, 2.1),
    new THREE.MeshStandardMaterial({ color: 0x20415a, roughness: 0.4, metalness: 0.12 })
  );
  seat.position.y = 0.69;
  seat.castShadow = true;
  seat.receiveShadow = true;
  benchGroup.add(seat);

  const cushionColors = [0xffb0b7, 0xf4e6a6, 0x8bf1d5];
  cushionColors.forEach((color, index) => {
    const cushion = createCushion(color);
    cushion.position.set(-1.8 + index * 1.8, 0.95, 0);
    benchGroup.add(cushion);
  });

  const throwBlanket = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.9, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0x283a4d,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide,
    })
  );
  throwBlanket.rotation.set(-Math.PI / 2, 0, Math.PI / 6);
  throwBlanket.position.set(2.2, 0.92, 0.6);
  throwBlanket.castShadow = true;
  benchGroup.add(throwBlanket);

  const leftPlanter = createPlanter();
  leftPlanter.position.set(-3.6, 0, -0.95);
  benchGroup.add(leftPlanter);

  const rightPlanter = createPlanter();
  rightPlanter.position.set(3.2, 0, 0.95);
  benchGroup.add(rightPlanter);

  scene.add(benchGroup);
}

function createCushion(color) {
  const cushion = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.45, 0.9),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.55,
      metalness: 0.08,
    })
  );
  cushion.castShadow = true;
  cushion.receiveShadow = true;
  cushion.rotation.y = 0.08;
  return cushion;
}

function createPlanter() {
  const group = new THREE.Group();

  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.5, 0.9, 18),
    new THREE.MeshStandardMaterial({
      color: 0x231423,
      roughness: 0.4,
      metalness: 0.3,
    })
  );
  pot.position.y = 0.45;
  pot.castShadow = true;
  pot.receiveShadow = true;
  group.add(pot);

  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.48, 0.12, 18),
    new THREE.MeshStandardMaterial({ color: 0x22131b, roughness: 0.6 })
  );
  soil.position.y = 0.9;
  group.add(soil);

  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: 0x5ef2b7,
    roughness: 0.6,
    metalness: 0.08,
  });

  for (let i = 0; i < 6; i += 1) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.9, 12), foliageMaterial);
    const angle = (i / 6) * Math.PI * 2;
    leaf.position.set(Math.cos(angle) * 0.3, 1, Math.sin(angle) * 0.3);
    leaf.rotation.x = -Math.PI / 3.2;
    leaf.castShadow = true;
    group.add(leaf);
  }

  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0x42e6a8, roughness: 0.7 })
  );
  canopy.position.y = 1.55;
  canopy.castShadow = true;
  group.add(canopy);

  return group;
}

function createWallpaperTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#122636");
  gradient.addColorStop(1, "#0c1a27");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(111, 242, 207, 0.25)";
  ctx.lineWidth = 4;
  const spacing = 64;
  for (let x = spacing / 2; x < canvas.width; x += spacing) {
    for (let y = spacing / 2; y < canvas.height; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - 18, y);
      ctx.quadraticCurveTo(x, y - 28, x + 18, y);
      ctx.quadraticCurveTo(x, y + 28, x - 18, y);
      ctx.stroke();
    }
  }

  return new THREE.CanvasTexture(canvas);
}

function createPanelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#14081a");
  gradient.addColorStop(1, "#1f0d29");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(91, 210, 195, 0.12)";
  ctx.lineWidth = 8;
  const spacing = 64;
  for (let x = 0; x <= canvas.width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + spacing / 2, canvas.height);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(180, 128, 210, 0.15)";
  ctx.lineWidth = 3;
  for (let y = spacing / 2; y < canvas.height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

function createCarpetTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#14283a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const radial = ctx.createRadialGradient(512, 512, 80, 512, 512, 420);
  radial.addColorStop(0, "rgba(107, 242, 208, 0.6)");
  radial.addColorStop(1, "rgba(107, 242, 208, 0)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(10, 23, 33, 0.85)";
  ctx.lineWidth = 28;
  ctx.strokeRect(90, 140, canvas.width - 180, canvas.height - 280);

  ctx.strokeStyle = "rgba(255, 176, 198, 0.35)";
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(120, 180);
  ctx.lineTo(canvas.width - 120, 180);
  ctx.lineTo(canvas.width - 200, canvas.height - 160);
  ctx.lineTo(160, canvas.height - 200);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = "rgba(94, 242, 183, 0.8)";
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2;
    const x = canvas.width / 2 + Math.cos(angle) * 220;
    const y = canvas.height / 2 + Math.sin(angle) * 140;
    ctx.beginPath();
    ctx.ellipse(x, y, 48, 22, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#07131e";
  ctx.beginPath();
  ctx.arc(canvas.width / 2 - 40, canvas.height / 2 + 20, 70, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

function createVase(index) {
  const colors = [0x94f5df, 0xf78fa7, 0xf3eec3];
  const vaseMaterial = new THREE.MeshStandardMaterial({
    color: colors[index % colors.length],
    roughness: 0.3,
    metalness: 0.05,
  });

  const vase = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    vaseMaterial
  );
  vase.scale.y = 1.5;
  vase.castShadow = true;
  vase.receiveShadow = true;
  return vase;
}

function createBookStack(index) {
  const group = new THREE.Group();
  const colors = [0x48e5c2, 0xff6f91, 0xffe0ac];

  for (let i = 0; i < 3; i += 1) {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.18, 0.9),
      new THREE.MeshStandardMaterial({
        color: colors[(index + i) % colors.length],
        roughness: 0.45,
        metalness: 0.05,
      })
    );
    book.position.y = i * 0.2;
    book.rotation.y = (i - 1) * 0.05;
    book.castShadow = true;
    book.receiveShadow = true;
    group.add(book);
  }

  return group;
}

