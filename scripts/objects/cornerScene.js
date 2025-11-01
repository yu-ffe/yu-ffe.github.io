import * as THREE from "three";

export const ROOM_DIMENSIONS = Object.freeze({
  width: 18,
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
    color: 0x113c4d,
    roughness: 0.88,
    metalness: 0.08,
  });

  const panelTexture = createPanelTexture();
  panelTexture.wrapS = THREE.RepeatWrapping;
  panelTexture.wrapT = THREE.RepeatWrapping;
  panelTexture.repeat.set(3, 2);
  panelTexture.colorSpace = THREE.SRGBColorSpace;
  panelTexture.anisotropy = 8;

  const panelMaterial = new THREE.MeshStandardMaterial({
    map: panelTexture,
    color: 0x1a0c1f,
    roughness: 0.92,
    metalness: 0.06,
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
    color: 0x0d0a11,
    roughness: 0.4,
    metalness: 0.3,
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
    color: 0x06040b,
    roughness: 0.95,
    metalness: 0.02,
  });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    floorMaterial
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = floorY;
  floor.receiveShadow = true;
  scene.add(floor);
}

export function createCarpet(scene) {
  const { floorY } = ROOM_DIMENSIONS;
  const carpetTexture = createCarpetTexture();
  carpetTexture.colorSpace = THREE.SRGBColorSpace;
  carpetTexture.anisotropy = 8;

  const carpet = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshStandardMaterial({
      map: carpetTexture,
      transparent: true,
      side: THREE.DoubleSide,
    })
  );
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(-1, floorY + 0.02, 0.5);
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
    { size: [3.6, 4.2], position: new THREE.Vector3(-2, floorY + 8.5, -2.5) },
    { size: [2.5, 3], position: new THREE.Vector3(-2.3, floorY + 5.5, 1.2) },
    { size: [1.8, 2.2], position: new THREE.Vector3(-1.2, floorY + 10.5, 2.8) },
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

  shelfGroup.position.set(2.5, floorY + shelfHeight / 2, -depth / 2 + shelfDepth / 2 + 0.05);
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
      5.2,
      floorY + height - 4.5 - offset,
      -depth / 2 + 0.6
    );
    board.castShadow = true;
    board.receiveShadow = true;
    scene.add(board);

    const decorGroup = new THREE.Group();
    decorGroup.position.copy(board.position);
    decorGroup.position.y += 0.4;
    decorGroup.position.z += 0.1;

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
    color: 0x2a0f21,
    roughness: 0.5,
    metalness: 0.3,
  });

  const tabletop = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.6, 0.25, 24),
    tableMaterial
  );
  tabletop.position.set(-1.3, floorY + 1.1, 0.8);
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  scene.add(tabletop);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.8, 1.2, 24),
    tableMaterial
  );
  pedestal.position.set(-1.3, floorY + 0.6, 0.8);
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  scene.add(pedestal);

  const lampGroup = new THREE.Group();
  lampGroup.position.set(-1.3, floorY + 1.4, 0.8);

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
  chandelierGroup.position.set(-0.5, floorY + height - 2.2, -1.2);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.07, 16, 48),
    new THREE.MeshStandardMaterial({ color: 0xfad6a5, metalness: 0.6, roughness: 0.3 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.castShadow = true;
  chandelierGroup.add(ring);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.2, 2.4, 16),
    new THREE.MeshStandardMaterial({ color: 0xfad6a5, metalness: 0.5, roughness: 0.35 })
  );
  stem.position.y = 1.4;
  chandelierGroup.add(stem);

  const ceilingCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.6, 0.35, 18),
    new THREE.MeshStandardMaterial({ color: 0xf5c995, metalness: 0.6, roughness: 0.35 })
  );
  ceilingCap.position.y = 2.4;
  chandelierGroup.add(ceilingCap);

  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2;
    const pendant = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfff1c1,
        emissive: 0xffe2a8,
        emissiveIntensity: 1.6,
        transparent: true,
        opacity: 0.95,
      })
    );
    pendant.position.set(Math.cos(angle) * 1.5, -0.55, Math.sin(angle) * 1.5);
    chandelierGroup.add(pendant);
  }

  scene.add(chandelierGroup);
}

function createWallpaperTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0c2735";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#1f6c7e";
  ctx.lineWidth = 6;
  const spacing = 64;
  for (let x = spacing / 2; x < canvas.width; x += spacing) {
    for (let y = spacing / 2; y < canvas.height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, y - 18);
      ctx.quadraticCurveTo(x + 12, y, x, y + 18);
      ctx.quadraticCurveTo(x - 12, y, x, y - 18);
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

  ctx.fillStyle = "#120713";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#251126";
  ctx.lineWidth = 12;
  const stripeCount = 9;
  for (let i = 0; i < stripeCount; i += 1) {
    const y = (canvas.height / stripeCount) * i;
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

  ctx.fillStyle = "#122439";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#0a131d";
  ctx.lineWidth = 16;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  ctx.strokeStyle = "#46d7bd";
  ctx.lineWidth = 24;
  ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);

  ctx.fillStyle = "#46d7bd";
  const leafCount = 6;
  for (let i = 0; i < leafCount; i += 1) {
    const angle = (i / leafCount) * Math.PI * 2;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(0, -220, 0, -360);
    ctx.quadraticCurveTo(90, -260, 40, -120);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = "#06111d";
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 90, 0, Math.PI * 2);
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

