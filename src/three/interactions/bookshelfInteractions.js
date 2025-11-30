// Modified version of the bookshelf interactions script.
// This adjusts the number of interactive books so we can assign more than three
// clickable entries (e.g. to our mini‑games).

import * as THREE from "three";

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

export function setupBookshelfInteractions(camera, books, bookEntries) {
  if (!camera || !Array.isArray(books) || books.length === 0) {
    return () => {};
  }

  // Keep only entries with a non‑empty link.
  const entries = Array.isArray(bookEntries)
    ? bookEntries.filter((entry) => typeof entry?.link === "string" && entry.link.length > 0)
    : [];

  // Allow up to 10 interactive books. Previously this was hard capped at 3, which
  // limited how many book links could be interactive. Our mini‑games require
  // more interactive entries.
  const interactiveCount = Math.min(entries.length, books.length, 10);
  if (interactiveCount === 0) {
    return () => {};
  }

  const selectedBooks = selectInteractiveBooks(books, interactiveCount);

  selectedBooks.forEach((book, index) => {
    const { link, text, title, color, target } = entries[index];
    book.userData.isInteractiveBook = true;
    book.userData.link = link;
    book.userData.title = title ?? text ?? "";
    book.userData.target = target;

    applyCustomBookStyle(book, color);
  });

  return registerHighlightHandlers(camera, selectedBooks);
}

function applyCustomBookStyle(book, color) {
  if (!color || !book?.material?.color) {
    return;
  }

  const desiredColor = new THREE.Color(color);
  book.material.color.copy(desiredColor);

  if (book.material.emissive) {
    const emissiveTint = desiredColor.clone().lerp(new THREE.Color(0xffffff), 0.15);
    book.material.emissive.copy(emissiveTint.multiplyScalar(0.16));
  }

  if (book.userData.highlight?.originalColor) {
    book.userData.highlight.originalColor.copy(desiredColor);
  }

  if (book.userData.highlight?.originalEmissive && book.material.emissive) {
    book.userData.highlight.originalEmissive.copy(book.material.emissive);
  }

  book.material.needsUpdate = true;
}

function registerHighlightHandlers(camera, interactiveBooks) {
  let hoveredBook = null;

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
    updatePointer(event.clientX, event.clientY);
    raycaster.setFromCamera(pointer, camera);
    const [hit] = raycaster.intersectObjects(interactiveBooks, false);
    updateHighlight(hit?.object ?? null);
  }

  function handlePointerOut(event) {
    if (!event.relatedTarget || !(event.relatedTarget instanceof Element)) {
      updateHighlight(null);
    }
  }

  function handleBlur() {
    updateHighlight(null);
  }

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerout", handlePointerOut);
  window.addEventListener("blur", handleBlur);

  return () => {
    updateHighlight(null);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerout", handlePointerOut);
    window.removeEventListener("blur", handleBlur);
  };
}

function updatePointer(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
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