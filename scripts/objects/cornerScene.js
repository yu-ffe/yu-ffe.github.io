import * as THREE from "three";

export const ROOM_DIMENSIONS = Object.freeze({
  width: 26,
  depth: 18,
  height: 16,
  floorY: -6,
});

export function buildArchitecture(scene) {
  const { width, depth, height, floorY } = ROOM_DIMENSIONS;

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x182632,
    roughness: 0.9,
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

  const backWallMaterial = new THREE.MeshStandardMaterial({
    color: 0x27445d,
    roughness: 0.85,
    metalness: 0.05,
  });
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.6),
    backWallMaterial
  );
  backWall.position.set(0, floorY + height / 2, -depth / 2 + 0.3);
  backWall.receiveShadow = true;
  scene.add(backWall);

  const returnWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, height, depth * 0.65),
    backWallMaterial
  );
  returnWall.position.set(width / 2 - 0.3, floorY + height / 2, -depth * 0.2);
  returnWall.receiveShadow = true;
  scene.add(returnWall);

  const fireplacePanelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d3044,
    roughness: 0.75,
    metalness: 0.04,
  });
  const fireplacePanel = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.38, height * 0.68, 0.32),
    fireplacePanelMaterial
  );
  fireplacePanel.position.set(width * 0.05, floorY + height * 0.56, -depth / 2 + 0.46);
  fireplacePanel.receiveShadow = true;
  scene.add(fireplacePanel);

  const baseboardMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d1119,
    roughness: 0.4,
    metalness: 0.2,
  });

  const backBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.4, 0.25),
    baseboardMaterial
  );
  backBaseboard.position.set(0, floorY + 0.2, -depth / 2 + 0.12);
  scene.add(backBaseboard);

  const sideBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.4, depth * 0.65),
    baseboardMaterial
  );
  sideBaseboard.position.set(width / 2 - 0.12, floorY + 0.2, -depth * 0.2);
  scene.add(sideBaseboard);

  const crownMaterial = new THREE.MeshStandardMaterial({
    color: 0x162030,
    roughness: 0.5,
    metalness: 0.15,
  });
  const crownBack = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.35, 0.35),
    crownMaterial
  );
  crownBack.position.set(0, floorY + height - 0.15, -depth / 2 + 0.175);
  scene.add(crownBack);

  const crownSide = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.35, depth * 0.65),
    crownMaterial
  );
  crownSide.position.set(width / 2 - 0.175, floorY + height - 0.15, -depth * 0.2);
  scene.add(crownSide);
}

export function createFloorPattern(scene) {
  const { floorY } = ROOM_DIMENSIONS;
  const patternGroup = new THREE.Group();
  patternGroup.position.y = floorY + 0.015;

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0xb94b3d,
    roughness: 0.55,
    metalness: 0.08,
  });
  const innerMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2d28a,
    roughness: 0.65,
    metalness: 0.05,
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x2f566e,
    roughness: 0.55,
    metalness: 0.1,
  });

  const mainDiamond = new THREE.Mesh(
    new THREE.ShapeGeometry(createDiamondShape(13, 9)),
    baseMaterial
  );
  mainDiamond.rotation.x = -Math.PI / 2;
  mainDiamond.position.set(-1.6, 0, -0.6);
  mainDiamond.receiveShadow = true;
  patternGroup.add(mainDiamond);

  const innerDiamond = new THREE.Mesh(
    new THREE.ShapeGeometry(createDiamondShape(7.5, 5.3)),
    innerMaterial
  );
  innerDiamond.rotation.x = -Math.PI / 2;
  innerDiamond.position.set(-1.6, 0.01, -0.6);
  patternGroup.add(innerDiamond);

  const centralAccent = new THREE.Mesh(
    new THREE.ShapeGeometry(createStarShape(3.1)),
    accentMaterial
  );
  centralAccent.rotation.x = -Math.PI / 2;
  centralAccent.position.set(-1.6, 0.02, -0.6);
  patternGroup.add(centralAccent);

  const pathMaterial = new THREE.MeshStandardMaterial({
    color: 0xf4c35b,
    roughness: 0.6,
    metalness: 0.05,
  });
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 12), pathMaterial);
  path.rotation.x = -Math.PI / 2;
  path.position.set(-6.4, 0.005, 1.2);
  patternGroup.add(path);

  const stripesMaterial = new THREE.MeshStandardMaterial({
    color: 0x14273a,
    roughness: 0.55,
    metalness: 0.12,
  });
  for (let i = -1; i <= 1; i += 2) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 12), stripesMaterial);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(-6.4 + i * 1.1, 0.006, 1.2);
    patternGroup.add(stripe);
  }

  scene.add(patternGroup);
}

export function addWindowWall(scene) {
  const { width, depth, height, floorY } = ROOM_DIMENSIONS;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b3146,
    roughness: 0.45,
    metalness: 0.3,
  });
  const windowGroup = new THREE.Group();
  windowGroup.position.set(-width / 2 + 0.25, floorY + height * 0.55, -depth * 0.05);

  const sill = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, depth * 0.88),
    frameMaterial
  );
  sill.position.set(0, -height * 0.25, 0);
  sill.castShadow = true;
  windowGroup.add(sill);

  const topBeam = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.45, depth * 0.88),
    frameMaterial
  );
  topBeam.position.set(0, height * 0.35, 0);
  windowGroup.add(topBeam);

  const mullionGeometry = new THREE.BoxGeometry(0.35, height * 0.6, 0.32);
  const paneCount = 4;
  for (let i = 0; i <= paneCount; i += 1) {
    const mullion = new THREE.Mesh(mullionGeometry, frameMaterial);
    mullion.position.set(0, 0, -depth * 0.4 + (depth * 0.8 * (i / paneCount)));
    mullion.castShadow = true;
    windowGroup.add(mullion);
  }

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x7fb2d4,
    roughness: 0.18,
    metalness: 0.0,
    transparent: true,
    opacity: 0.35,
    envMapIntensity: 0.4,
    emissive: new THREE.Color(0x11314d),
    emissiveIntensity: 0.35,
  });

  const paneWidth = (depth * 0.8) / paneCount;
  const paneHeight = height * 0.6;
  for (let i = 0; i < paneCount; i += 1) {
    const pane = new THREE.Mesh(
      new THREE.PlaneGeometry(paneWidth, paneHeight),
      glassMaterial
    );
    pane.rotation.y = Math.PI / 2;
    pane.position.set(
      0.01,
      0,
      -depth * 0.4 + paneWidth * (i + 0.5)
    );
    pane.receiveShadow = false;
    windowGroup.add(pane);
  }

  scene.add(windowGroup);
}

export function addFireplace(scene) {
  const { width, depth, floorY, height } = ROOM_DIMENSIONS;
  const fireplaceGroup = new THREE.Group();
  fireplaceGroup.position.set(width * 0.08, floorY + 0.35, -depth / 2 + 0.45);

  const hearthMaterial = new THREE.MeshStandardMaterial({
    color: 0x2b1a1c,
    roughness: 0.6,
    metalness: 0.1,
  });
  const hearth = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.6, 1.6),
    hearthMaterial
  );
  hearth.castShadow = true;
  hearth.receiveShadow = true;
  hearth.position.set(0, 0, 0);
  fireplaceGroup.add(hearth);

  const surroundMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0d7ab,
    roughness: 0.45,
    metalness: 0.08,
  });
  const surround = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 3.8, 1.2),
    surroundMaterial
  );
  surround.position.set(0, 2.3, -0.05);
  surround.castShadow = true;
  surround.receiveShadow = true;
  fireplaceGroup.add(surround);

  const cavityMaterial = new THREE.MeshStandardMaterial({
    color: 0x101017,
    roughness: 0.9,
    metalness: 0.05,
    emissive: 0x1a2a3a,
    emissiveIntensity: 0.4,
  });
  const cavity = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 2.2, 0.9),
    cavityMaterial
  );
  cavity.position.set(0, 2.2, -0.25);
  cavity.receiveShadow = true;
  fireplaceGroup.add(cavity);

  const fireTexture = createFireTexture();
  const fireMaterial = new THREE.MeshStandardMaterial({
    map: fireTexture,
    transparent: true,
    emissive: 0xfaa24b,
    emissiveIntensity: 0.8,
  });
  const firePlane = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), fireMaterial);
  firePlane.position.set(0, 2.1, -0.4);
  firePlane.rotation.y = Math.PI;
  fireplaceGroup.add(firePlane);

  const mantle = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 0.35, 1.4),
    hearthMaterial
  );
  mantle.position.set(0, 4.1, -0.05);
  mantle.castShadow = true;
  fireplaceGroup.add(mantle);

  const mount = new THREE.Mesh(
    new THREE.BoxGeometry(3.1, 1.8, 0.2),
    new THREE.MeshStandardMaterial({
      color: 0x1c2d41,
      roughness: 0.6,
      metalness: 0.1,
    })
  );
  mount.position.set(0, 5.4, 0.35);
  fireplaceGroup.add(mount);

  const deer = createDeerBust();
  deer.position.set(0, 5.2, 0.7);
  fireplaceGroup.add(deer);

  const bookMaterial = new THREE.MeshStandardMaterial({
    color: 0xe05f4a,
    roughness: 0.55,
    metalness: 0.1,
  });
  const book = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 1.4), bookMaterial);
  book.position.set(-1.4, 4.35, 0);
  book.rotation.y = 0.1;
  fireplaceGroup.add(book);

  const secondBook = book.clone();
  secondBook.material = book.material.clone();
  secondBook.material.color = new THREE.Color(0xf1c46d);
  secondBook.position.set(-0.5, 4.38, 0.1);
  secondBook.rotation.y = -0.2;
  fireplaceGroup.add(secondBook);

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xb74b3b,
    roughness: 0.4,
    metalness: 0.15,
  });
  const frameGeometry = new THREE.BoxGeometry(1.6, 1.8, 0.08);
  const frameOffset = 3.1;
  for (let i = -1; i <= 1; i += 2) {
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(frameOffset * i, 6.2, 0.3);
    frame.rotation.y = 0.12 * -i;
    fireplaceGroup.add(frame);
  }

  scene.add(fireplaceGroup);
}

export function addFurniture(scene) {
  const { floorY } = ROOM_DIMENSIONS;
  const sofaGroup = new THREE.Group();
  sofaGroup.position.set(-4.6, floorY + 0.6, 0.6);
  sofaGroup.rotation.y = Math.PI / 14;

  const sofaMaterial = new THREE.MeshStandardMaterial({
    color: 0xc24138,
    roughness: 0.55,
    metalness: 0.15,
  });
  const cushionMaterial = new THREE.MeshStandardMaterial({
    color: 0xe97b63,
    roughness: 0.5,
    metalness: 0.12,
  });

  const base = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.8, 2.3), sofaMaterial);
  base.castShadow = true;
  base.receiveShadow = true;
  sofaGroup.add(base);

  const back = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.1, 0.4), cushionMaterial);
  back.position.set(0, 1.45, -0.95);
  back.castShadow = true;
  sofaGroup.add(back);

  const armGeometry = new THREE.BoxGeometry(0.55, 1.8, 2.3);
  const leftArm = new THREE.Mesh(armGeometry, sofaMaterial);
  leftArm.position.set(-3, 0.9, 0);
  sofaGroup.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 3;
  sofaGroup.add(rightArm);

  const cushion = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, 2), cushionMaterial);
  cushion.position.set(0, 0.85, 0);
  sofaGroup.add(cushion);

  scene.add(sofaGroup);

  const tableMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5d4a0,
    roughness: 0.4,
    metalness: 0.2,
  });
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.12, 24), tableMaterial);
  tableTop.position.set(-8.8, floorY + 1.1, -0.4);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  scene.add(tableTop);

  const tableStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.4, 1, 18),
    new THREE.MeshStandardMaterial({
      color: 0x2c3d50,
      roughness: 0.35,
      metalness: 0.25,
    })
  );
  tableStem.position.set(-8.8, floorY + 0.6, -0.4);
  tableStem.castShadow = true;
  scene.add(tableStem);

  const planterGroup = new THREE.Group();
  planterGroup.position.set(-9.6, floorY + 0.6, 3.2);

  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.8, 0.8, 16),
    new THREE.MeshStandardMaterial({
      color: 0x2a313c,
      roughness: 0.5,
      metalness: 0.2,
    })
  );
  pot.castShadow = true;
  pot.receiveShadow = true;
  planterGroup.add(pot);

  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: 0x3ad29a,
    roughness: 0.45,
    metalness: 0.15,
    emissive: 0x1f6d4a,
    emissiveIntensity: 0.2,
  });

  const leafGeometry = new THREE.SphereGeometry(0.95, 16, 16);
  for (let i = 0; i < 3; i += 1) {
    const cluster = new THREE.Mesh(leafGeometry, foliageMaterial);
    cluster.scale.y = 1.35;
    cluster.position.set((i - 1) * 0.45, 0.85 + i * 0.18, 0);
    cluster.castShadow = true;
    planterGroup.add(cluster);
  }

  scene.add(planterGroup);
}

export function addSilhouettes(scene) {
  const { floorY } = ROOM_DIMENSIONS;
  const woman = createSilhouetteMesh(1.4, 4.8, drawWomanSilhouette, {
    color: "#d74a3a",
    shadow: "rgba(0,0,0,0.18)",
  });
  woman.position.set(-9.2, floorY + 2.5, 1.3);
  woman.rotation.y = Math.PI / 2.2;
  scene.add(woman);

  const cat = createSilhouetteMesh(1.1, 1.2, drawCatSilhouette, {
    color: "#132535",
    shadow: "rgba(0,0,0,0.15)",
  });
  cat.position.set(-6.5, floorY + 0.6, 2.1);
  cat.rotation.y = Math.PI / 6;
  scene.add(cat);
}

export function addDecor(scene) {
  const { width, depth, floorY, height } = ROOM_DIMENSIONS;

  const wallLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5c37a,
    emissive: 0xf9b45b,
    emissiveIntensity: 0.8,
    roughness: 0.45,
  });

  for (let i = -1; i <= 1; i += 2) {
    const sconce = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.5, 0.7, 20, 1, true),
      wallLightMaterial
    );
    sconce.position.set(width * 0.05 + i * 2.3, floorY + height * 0.63, -depth / 2 + 0.6);
    sconce.rotation.x = Math.PI / 2;
    sconce.castShadow = true;
    scene.add(sconce);
  }

  const trimMaterial = new THREE.MeshStandardMaterial({
    color: 0x13273a,
    roughness: 0.5,
    metalness: 0.2,
  });
  const step = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.35, 1.2), trimMaterial);
  step.position.set(-6.2, floorY + 0.18, 2.6);
  step.receiveShadow = true;
  scene.add(step);

  const paintingMaterial = new THREE.MeshStandardMaterial({
    color: 0x102438,
    roughness: 0.6,
    metalness: 0.15,
  });
  const painting = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 0.18), paintingMaterial);
  painting.position.set(width / 2 - 0.42, floorY + height * 0.58, -depth * 0.05);
  scene.add(painting);
}

function createDiamondShape(width, height) {
  const shape = new THREE.Shape();
  shape.moveTo(0, height / 2);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, -height / 2);
  shape.lineTo(-width / 2, 0);
  shape.lineTo(0, height / 2);
  return shape;
}

function createStarShape(radius) {
  const shape = new THREE.Shape();
  const points = 6;
  for (let i = 0; i <= points; i += 1) {
    const angle = (i / points) * Math.PI * 2;
    const inner = radius * (i % 2 === 0 ? 0.45 : 1);
    const x = Math.cos(angle) * inner;
    const y = Math.sin(angle) * inner;
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  return shape;
}

function createSilhouetteMesh(width, height, drawFn, { color, shadow }) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFn(ctx, canvas.width, canvas.height, color, shadow);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 0.6,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  return mesh;
}

function drawWomanSilhouette(ctx, width, height, color, shadow) {
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(width * 0.6, height * 0.93, width * 0.12, height * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(width * 0.48, height * 0.95);
  ctx.quadraticCurveTo(width * 0.36, height * 0.72, width * 0.44, height * 0.48);
  ctx.quadraticCurveTo(width * 0.48, height * 0.34, width * 0.42, height * 0.2);
  ctx.quadraticCurveTo(width * 0.46, height * 0.08, width * 0.54, height * 0.04);
  ctx.quadraticCurveTo(width * 0.66, height * 0.06, width * 0.7, height * 0.18);
  ctx.quadraticCurveTo(width * 0.72, height * 0.32, width * 0.66, height * 0.46);
  ctx.quadraticCurveTo(width * 0.76, height * 0.66, width * 0.68, height * 0.95);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f3d098";
  ctx.beginPath();
  ctx.arc(width * 0.58, height * 0.16, width * 0.07, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(width * 0.53, height * 0.18);
  ctx.quadraticCurveTo(width * 0.6, height * 0.24, width * 0.64, height * 0.38);
  ctx.lineTo(width * 0.6, height * 0.42);
  ctx.quadraticCurveTo(width * 0.56, height * 0.26, width * 0.5, height * 0.2);
  ctx.closePath();
  ctx.fill();
}

function drawCatSilhouette(ctx, width, height, color, shadow) {
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(width * 0.6, height * 0.92, width * 0.3, height * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(width * 0.32, height * 0.85);
  ctx.quadraticCurveTo(width * 0.38, height * 0.68, width * 0.45, height * 0.55);
  ctx.quadraticCurveTo(width * 0.5, height * 0.48, width * 0.6, height * 0.48);
  ctx.quadraticCurveTo(width * 0.76, height * 0.5, width * 0.8, height * 0.7);
  ctx.quadraticCurveTo(width * 0.84, height * 0.9, width * 0.72, height * 0.86);
  ctx.quadraticCurveTo(width * 0.6, height * 0.8, width * 0.48, height * 0.88);
  ctx.quadraticCurveTo(width * 0.38, height * 0.94, width * 0.32, height * 0.85);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(width * 0.55, height * 0.52);
  ctx.bezierCurveTo(width * 0.5, height * 0.38, width * 0.6, height * 0.28, width * 0.65, height * 0.38);
  ctx.bezierCurveTo(width * 0.7, height * 0.46, width * 0.68, height * 0.6, width * 0.6, height * 0.6);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(width * 0.52, height * 0.36);
  ctx.quadraticCurveTo(width * 0.58, height * 0.28, width * 0.62, height * 0.34);
  ctx.quadraticCurveTo(width * 0.66, height * 0.26, width * 0.7, height * 0.32);
  ctx.quadraticCurveTo(width * 0.68, height * 0.4, width * 0.62, height * 0.42);
  ctx.closePath();
  ctx.fill();
}

function createDeerBust() {
  const deerGroup = new THREE.Group();

  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xb96f46,
    roughness: 0.45,
    metalness: 0.2,
  });
  const hornMaterial = new THREE.MeshStandardMaterial({
    color: 0xe9c799,
    roughness: 0.35,
    metalness: 0.25,
  });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), headMaterial);
  head.scale.set(1, 1.25, 1);
  head.position.set(0, 0.4, 0);
  head.castShadow = true;
  deerGroup.add(head);

  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 20), headMaterial);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, -0.05, 0.55);
  deerGroup.add(snout);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 1.4, 16), headMaterial);
  neck.position.set(0, -0.9, 0.1);
  deerGroup.add(neck);

  const plaque = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.45, 0.25, 24),
    new THREE.MeshStandardMaterial({
      color: 0x1c2d41,
      roughness: 0.55,
      metalness: 0.15,
    })
  );
  plaque.rotation.z = Math.PI / 2;
  plaque.position.set(0, -0.6, -0.15);
  deerGroup.add(plaque);

  const hornLeft = createHornMesh(hornMaterial);
  hornLeft.position.set(-0.2, 0.75, 0);
  hornLeft.rotation.z = Math.PI * 0.18;
  deerGroup.add(hornLeft);

  const hornRight = createHornMesh(hornMaterial);
  hornRight.position.set(0.2, 0.75, 0);
  hornRight.rotation.z = -Math.PI * 0.18;
  hornRight.scale.x = -1;
  deerGroup.add(hornRight);

  return deerGroup;
}

function createHornMesh(material) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.2, 0.4, 0.1),
    new THREE.Vector3(0.45, 0.9, -0.05),
    new THREE.Vector3(0.25, 1.35, -0.2),
  ]);
  const geometry = new THREE.TubeGeometry(curve, 32, 0.07, 12, false);
  const horn = new THREE.Mesh(geometry, material);
  horn.castShadow = true;
  return horn;
}

function createFireTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
  gradient.addColorStop(0, "rgba(20,28,40,0.05)");
  gradient.addColorStop(0.2, "rgba(244,143,64,0.65)");
  gradient.addColorStop(0.45, "rgba(250,190,94,0.8)");
  gradient.addColorStop(1, "rgba(255,255,210,0.9)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,244,210,0.85)";
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(canvas.width * (0.2 + 0.3 * i), canvas.height * 0.95);
    ctx.quadraticCurveTo(
      canvas.width * (0.15 + 0.3 * i),
      canvas.height * (0.65 - 0.1 * i),
      canvas.width * (0.25 + 0.3 * i),
      canvas.height * 0.2
    );
    ctx.quadraticCurveTo(
      canvas.width * (0.38 + 0.2 * i),
      canvas.height * (0.4 - 0.05 * i),
      canvas.width * (0.32 + 0.26 * i),
      canvas.height * 0.95
    );
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
