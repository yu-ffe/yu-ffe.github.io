// Stream_LiveGame :: 책장 상호작용 구현을 위한 Three.js 도구를 사용한다.
import * as THREE from "three";
import { projectPointerToNDC } from "./utils/projectPointerToNDC.js";

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

export function setupBookshelfInteractions(camera, books, bookEntries, domElement) {
  if (!camera || !Array.isArray(books) || books.length === 0) {
    return () => {};
  }

  const entries = Array.isArray(bookEntries)
    ? bookEntries.filter((entry) => typeof entry?.link === "string" && entry.link.length > 0)
    : [];

  const interactiveCount = Math.min(entries.length, books.length, 3);
  if (interactiveCount === 0) {
    return () => {};
  }

  const selectedBooks = selectInteractiveBooks(books, interactiveCount);

  selectedBooks.forEach((book, index) => {
    const { link, text, title } = entries[index];
    book.userData.isInteractiveBook = true;
    book.userData.link = link;
    book.userData.title = title ?? text ?? "";
  });

  return registerHighlightHandlers(camera, selectedBooks, domElement);
}

function registerHighlightHandlers(camera, interactiveBooks, domElement) {
  let hoveredBook = null;

  const eventTarget = domElement ?? window;

  function updateHighlight(target) {
    if (hoveredBook === target) {
      return;
    }

    if (hoveredBook) {
      resetHighlight(hoveredBook);
    }

    hoveredBook = target ?? null;

    if (hoveredBook) {
      applyHighlight(hoveredBook);
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "";
    }
  }

  function handlePointerMove(event) {
    updatePointer(event, domElement);
    raycaster.setFromCamera(pointer, camera);
    const [hit] = raycaster.intersectObjects(interactiveBooks, false);
    updateHighlight(hit?.object ?? null);
  }

  function handlePointerLeave() {
    updateHighlight(null);
  }

  function handleBlur() {
    updateHighlight(null);
  }

  eventTarget.addEventListener("pointermove", handlePointerMove);
  eventTarget.addEventListener("pointerleave", handlePointerLeave);
  window.addEventListener("blur", handleBlur);

  return () => {
    updateHighlight(null);
    eventTarget.removeEventListener("pointermove", handlePointerMove);
    eventTarget.removeEventListener("pointerleave", handlePointerLeave);
    window.removeEventListener("blur", handleBlur);
  };
}

function updatePointer(event, domElement) {
  const { x, y } = projectPointerToNDC(event, domElement);
  pointer.set(x, y);
}

function applyHighlight(book) {
  const highlight = book.userData.highlight;
  if (!highlight) {
    return;
  }

  const { originalPosition, originalColor, originalEmissive } = highlight;

  if (originalPosition) {
    book.position.copy(originalPosition);
    book.position.z = originalPosition.z + 0.3;
  }

  if (originalColor) {
    const hsl = {};
    book.material.color.copy(originalColor);
    book.material.color.getHSL(hsl);
    book.material.color.setHSL(hsl.h, hsl.s * 0.9, Math.min(1, hsl.l + 0.18));
  }

  if (originalEmissive) {
    book.material.emissive.copy(originalEmissive).lerp(new THREE.Color(0xfff1c2), 0.6);
    if (typeof book.material.emissiveIntensity === "number") {
      book.material.emissiveIntensity = 1.2;
    }
  }

  book.material.needsUpdate = true;
}

function resetHighlight(book) {
  const highlight = book.userData.highlight;
  if (!highlight) {
    return;
  }

  const { originalPosition, originalColor, originalEmissive } = highlight;

  if (originalPosition) {
    book.position.copy(originalPosition);
  }

  if (originalColor) {
    book.material.color.copy(originalColor);
  }

  if (originalEmissive) {
    book.material.emissive.copy(originalEmissive);
    if (typeof book.material.emissiveIntensity === "number") {
      book.material.emissiveIntensity = 1;
    }
  }

  book.material.needsUpdate = true;
}

function selectInteractiveBooks(books, count) {
  const selected = [];
  const usedIndices = new Set();
  let seed = 97;

  while (selected.length < count && usedIndices.size < books.length) {
    const candidateIndex = Math.floor(deterministicRandom(seed) * books.length);
    seed += 1;

    if (usedIndices.has(candidateIndex)) {
      continue;
    }

    usedIndices.add(candidateIndex);
    selected.push(books[candidateIndex]);
  }

  return selected;
}

function deterministicRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
