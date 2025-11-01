import * as THREE from "three";

export const ROOM_DIMENSIONS = Object.freeze({
  width: 22,
  depth: 20,
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
    color: 0x103447,
    roughness: 0.85,
    metalness: 0.08,
    emissive: 0x071b26,
    emissiveIntensity: 0.2,
  });

  const panelTexture = createPanelTexture();
  panelTexture.wrapS = THREE.RepeatWrapping;
  panelTexture.wrapT = THREE.RepeatWrapping;
  panelTexture.repeat.set(3, 2);
  panelTexture.colorSpace = THREE.SRGBColorSpace;
  panelTexture.anisotropy = 8;

  const panelMaterial = new THREE.MeshStandardMaterial({
    map: panelTexture,
    color: 0x130713,
    roughness: 0.94,
    metalness: 0.05,
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
    color: 0x09060f,
    roughness: 0.35,
    metalness: 0.25,
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
    color: 0x05030a,
    roughness: 0.96,
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
    new THREE.PlaneGeometry(14.5, 14.5),
    new THREE.MeshStandardMaterial({
      map: carpetTexture,
      transparent: true,
      side: THREE.DoubleSide,
    })
  );
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(-0.5, floorY + 0.02, 0.6);
  carpet.receiveShadow = true;
  scene.add(carpet);
}

export function createBranchShadow(scene) {
  const { floorY } = ROOM_DIMENSIONS;
  const shadowTexture = createBranchShadowTexture();
  shadowTexture.colorSpace = THREE.SRGBColorSpace;

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 12),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.85,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(-3.8, floorY + 0.025, 3.4);
  scene.add(shadow);
}

export function createPictureFrames(scene) {
  const { width, floorY } = ROOM_DIMENSIONS;
  const frameColor = 0x5bf1d5;
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: frameColor,
    emissive: 0x132f3f,
    emissiveIntensity: 0.4,
    metalness: 0.2,
    roughness: 0.35,
  });

  const frames = [
    { size: [4.2, 4.8], position: new THREE.Vector3(-2.2, floorY + 9.6, -2.4) },
    {
      size: [3.1, 3.6],
      position: new THREE.Vector3(-2.4, floorY + 6.4, 1.2),
      accent: "triangle",
    },
    { size: [1.8, 2.2], position: new THREE.Vector3(-1.4, floorY + 11.2, 2.8) },
    { size: [1.2, 2.2], position: new THREE.Vector3(-1.6, floorY + 5.1, -0.4) },
  ];

  const frameDepth = 0.14;
  const barThickness = 0.18;

  frames.forEach(({ size, position, accent }) => {
    const [w, h] = size;
    const group = new THREE.Group();

    const verticalGeometry = new THREE.BoxGeometry(barThickness, h, frameDepth);
    const horizontalGeometry = new THREE.BoxGeometry(w, barThickness, frameDepth);

    const leftBar = new THREE.Mesh(verticalGeometry, frameMaterial);
    leftBar.position.x = -w / 2 + barThickness / 2;
    group.add(leftBar);

    const rightBar = leftBar.clone();
    rightBar.position.x = w / 2 - barThickness / 2;
    group.add(rightBar);

    const topBar = new THREE.Mesh(horizontalGeometry, frameMaterial);
    topBar.position.y = h / 2 - barThickness / 2;
    group.add(topBar);

    const bottomBar = topBar.clone();
    bottomBar.position.y = -h / 2 + barThickness / 2;
    group.add(bottomBar);

    if (accent === "triangle") {
      const artMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4f6a,
        transparent: true,
        opacity: 0.9,
      });
      const art = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, h * 0.8), artMaterial);
      art.position.z = frameDepth / 2 + 0.02;
      art.position.y = -h * 0.05;
      art.rotation.z = -Math.PI / 4.5;
      group.add(art);
    }

    group.position.copy(position);
    group.position.x = -width / 2 + 0.18;
    group.rotation.y = Math.PI / 2;

    scene.add(group);
  });
}

export function createBookshelf(scene) {
  const { depth, floorY } = ROOM_DIMENSIONS;
  const shelfWidth = 8.4;
  const shelfHeight = 10.5;
  const shelfDepth = 1.1;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x102334,
    roughness: 0.55,
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
    color: 0x15344a,
    roughness: 0.7,
    metalness: 0.1,
  });

  const shelfLevels = 5;
  const shelfGeometry = new THREE.BoxGeometry(shelfWidth - 0.4, 0.18, shelfDepth - 0.1);
  for (let i = 1; i <= shelfLevels; i += 1) {
    const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.y = -shelfHeight / 2 + (i * shelfHeight) / (shelfLevels + 1);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    shelfGroup.add(shelf);
  }

  const bookColors = [0xff4f6a, 0x5bf1d5, 0x2f7c90, 0xf2f7f7];
  const bookGeometry = new THREE.BoxGeometry(0.32, 1, 0.7);
  const booksPerShelf = 10;
  for (let level = 0; level < shelfLevels; level += 1) {
    for (let i = 0; i < booksPerShelf; i += 1) {
      const height = 1.1 + Math.random() * 2.1;
      const material = new THREE.MeshStandardMaterial({
        color: bookColors[(level * booksPerShelf + i) % bookColors.length],
        roughness: 0.45,
        metalness: 0.08,
      });
      const book = new THREE.Mesh(bookGeometry.clone(), material);
      book.scale.y = height;
      book.position.set(
        -shelfWidth / 2 + 0.55 + i * 0.7,
        -shelfHeight / 2 + ((level + 1.15) * shelfHeight) / (shelfLevels + 1) + height * 0.5,
        -0.08 + Math.random() * 0.18
      );
      book.rotation.z = (Math.random() - 0.5) * 0.12;
      book.castShadow = true;
      shelfGroup.add(book);
    }
  }

  const leaningFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 2.1, 0.18),
    new THREE.MeshStandardMaterial({
      color: 0x5bf1d5,
      emissive: 0x15394a,
      emissiveIntensity: 0.35,
      metalness: 0.2,
      roughness: 0.35,
    })
  );
  leaningFrame.position.set(-1.1, shelfHeight / 2 - 0.8, shelfDepth / 2 - 0.05);
  leaningFrame.rotation.y = Math.PI / 8;
  shelfGroup.add(leaningFrame);

  shelfGroup.position.set(2.8, floorY + shelfHeight / 2, -depth / 2 + shelfDepth / 2 + 0.1);
  scene.add(shelfGroup);
}

export function createFloatingShelves(scene) {
  const { depth, floorY, height } = ROOM_DIMENSIONS;

  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: 0x12283b,
    roughness: 0.55,
    metalness: 0.2,
  });

  const boardGeometry = new THREE.BoxGeometry(4.8, 0.22, 0.6);
  const offsets = [0, 2, 4, 5.8];

  offsets.forEach((offset, index) => {
    const board = new THREE.Mesh(boardGeometry, shelfMaterial);
    board.position.set(
      5.4,
      floorY + height - 4.3 - offset,
      -depth / 2 + 0.6
    );
    board.castShadow = true;
    board.receiveShadow = true;
    scene.add(board);

    const decorGroup = new THREE.Group();
    decorGroup.position.copy(board.position);
    decorGroup.position.y += 0.35;
    decorGroup.position.z += 0.05;

    if (index % 2 === 0) {
      const stack = createBookStack(index);
      stack.position.set(-0.9, 0, 0.05);
      decorGroup.add(stack);
    } else {
      const vase = createVase(index);
      vase.position.set(0.4, 0, 0);
      decorGroup.add(vase);
    }

    scene.add(decorGroup);
  });
}

export function createAccentTables(scene) {
  const { floorY } = ROOM_DIMENSIONS;

  const tableMaterial = new THREE.MeshStandardMaterial({
    color: 0x251027,
    roughness: 0.48,
    metalness: 0.28,
  });

  const lampShadeMaterial = new THREE.MeshStandardMaterial({
    color: 0xf4d7b8,
    emissive: 0xf6cfa3,
    emissiveIntensity: 0.75,
    transparent: true,
    opacity: 0.92,
  });

  const positions = [
    new THREE.Vector3(-3.5, floorY, -0.1),
    new THREE.Vector3(1.8, floorY, -0.1),
  ];

  positions.forEach((basePosition) => {
    const tableGroup = new THREE.Group();
    tableGroup.position.copy(basePosition);

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.9, 1.25, 28),
      tableMaterial
    );
    pedestal.position.y = 0.65;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    tableGroup.add(pedestal);

    const tabletop = new THREE.Mesh(
      new THREE.CylinderGeometry(1.45, 1.45, 0.25, 32),
      tableMaterial
    );
    tabletop.position.y = 1.3;
    tabletop.castShadow = true;
    tabletop.receiveShadow = true;
    tableGroup.add(tabletop);

    const lampGroup = new THREE.Group();
    lampGroup.position.y = 1.65;

    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.34, 0.4, 18),
      new THREE.MeshStandardMaterial({ color: 0x102639, roughness: 0.4, metalness: 0.3 })
    );
    lampBase.castShadow = true;
    lampBase.receiveShadow = true;
    lampGroup.add(lampBase);

    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.95, 28, 1, true), lampShadeMaterial);
    lampShade.position.y = 0.82;
    lampGroup.add(lampShade);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 18, 18),
      new THREE.MeshStandardMaterial({
        color: 0xfff2c8,
        emissive: 0xffe8b2,
        emissiveIntensity: 1.5,
      })
    );
    bulb.position.y = 0.38;
    lampGroup.add(bulb);

    tableGroup.add(lampGroup);

    scene.add(tableGroup);
  });
}

export function createChandelier(scene) {
  const { floorY, height } = ROOM_DIMENSIONS;

  const chandelierGroup = new THREE.Group();
  chandelierGroup.position.set(-0.3, floorY + height - 2.1, -1.1);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.85, 0.06, 16, 52),
    new THREE.MeshStandardMaterial({ color: 0xfad6a5, metalness: 0.65, roughness: 0.32 })
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

  const candleMaterial = new THREE.MeshStandardMaterial({
    color: 0xfaf1dd,
    emissive: 0xf6e6c8,
    emissiveIntensity: 0.25,
  });

  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2;
    const arm = new THREE.Group();
    arm.position.set(Math.cos(angle) * 1.55, -0.3, Math.sin(angle) * 1.55);

    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 12), candleMaterial);
    candle.position.y = 0.15;
    candle.castShadow = true;
    arm.add(candle);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.28, 12),
      new THREE.MeshStandardMaterial({
        color: 0xff5771,
        emissive: 0xff4f6a,
        emissiveIntensity: 1.1,
      })
    );
    flame.position.y = 0.65;
    arm.add(flame);

    chandelierGroup.add(arm);
  }

  scene.add(chandelierGroup);
}

function createWallpaperTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0b2534";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#195264";
  const spacing = 96;
  for (let x = spacing / 2; x < canvas.width; x += spacing) {
    for (let y = spacing / 2; y < canvas.height; y += spacing) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, 1.2);
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.quadraticCurveTo(18, -10, 0, 18);
      ctx.quadraticCurveTo(-18, -10, 0, -26);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 18);
      ctx.quadraticCurveTo(12, 32, 0, 42);
      ctx.quadraticCurveTo(-12, 32, 0, 18);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.strokeStyle = "#51f1d3";
  ctx.lineWidth = 4;
  for (let x = 0; x <= canvas.width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + spacing / 2, 0);
    ctx.lineTo(x + spacing / 2, canvas.height);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

function createPanelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#130712";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#2b132b";
  ctx.lineWidth = 14;
  const stripeCount = 10;
  for (let i = 0; i <= stripeCount; i += 1) {
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

  ctx.fillStyle = "#10374c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#071b29";
  ctx.lineWidth = 26;
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  ctx.strokeStyle = "#51f1d3";
  ctx.lineWidth = 30;
  ctx.strokeRect(96, 96, canvas.width - 192, canvas.height - 192);

  ctx.strokeStyle = "#0b2232";
  ctx.lineWidth = 14;
  ctx.strokeRect(160, 160, canvas.width - 320, canvas.height - 320);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const leafColor = "#4ce8c9";
  const leafCount = 8;
  for (let i = 0; i < leafCount; i += 1) {
    const angle = (i / leafCount) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(0, -210, 0, -360);
    ctx.quadraticCurveTo(110, -260, 46, -130);
    ctx.closePath();
    ctx.fillStyle = leafColor;
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = "#07111c";
  ctx.beginPath();
  ctx.arc(cx, cy, 110, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(5, 11, 19, 0.96)";
  ctx.beginPath();
  ctx.moveTo(cx + 60, cy + 40);
  ctx.quadraticCurveTo(cx + 140, cy + 260, cx + 260, cy + 300);
  ctx.quadraticCurveTo(cx + 200, cy + 340, cx + 110, cy + 330);
  ctx.quadraticCurveTo(cx + 70, cy + 300, cx + 10, cy + 200);
  ctx.quadraticCurveTo(cx - 60, cy + 100, cx - 190, cy + 120);
  ctx.quadraticCurveTo(cx - 110, cy + 40, cx - 40, cy + 10);
  ctx.closePath();
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

function createBranchShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(8, 16, 24, 0.86)";
  ctx.beginPath();
  ctx.moveTo(40, canvas.height);
  ctx.quadraticCurveTo(220, 520, 420, 500);
  ctx.quadraticCurveTo(610, 490, 780, 420);
  ctx.quadraticCurveTo(920, 360, canvas.width, 300);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(8, 16, 24, 0.85)";
  ctx.lineWidth = 48;
  ctx.lineCap = "round";
  const branches = [
    [120, 660, 260, 520, 360, 470],
    [260, 640, 360, 540, 470, 500],
    [420, 640, 560, 540, 700, 500],
  ];
  branches.forEach(([sx, sy, cpx, cpy, ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cpx, cpy, ex, ey);
    ctx.stroke();
  });

  ctx.strokeStyle = "rgba(8, 16, 24, 0.72)";
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.moveTo(360, 550);
  ctx.quadraticCurveTo(430, 460, 540, 430);
  ctx.stroke();

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

