// Stream_LiveGame :: 책장 상호작용과 관련된 유틸리티를 제공한다.
import * as THREE from "three";

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const DEFAULT_HOVER_OFFSET = 0.32;
const DEFAULT_ACCENT = new THREE.Color(0xffd166);

export function setupBookshelfInteractions(camera, scene) {
  const abortController = new AbortController();
  const canvas = document.getElementById("webgl-canvas");

  let interactiveBooks = [];
  let hoveredBook = null;
  let interactionReady = false;

  function highlightBook(book) {
    if (!book.userData.originalPosition) {
      book.userData.originalPosition = book.position.clone();
    }

    const { accentColor = DEFAULT_ACCENT, hoverOffset = DEFAULT_HOVER_OFFSET } = book.userData;
    book.position.setZ(book.userData.originalPosition.z + hoverOffset);

    if (!book.userData.originalColor) {
      book.userData.originalColor = book.material.color.clone();
    }
    if (!book.userData.originalEmissive) {
      book.userData.originalEmissive = book.material.emissive.clone();
    }
    if (typeof book.userData.originalEmissiveIntensity === "undefined") {
      book.userData.originalEmissiveIntensity = book.material.emissiveIntensity ?? 1;
    }

    book.material.color.copy(accentColor);
    book.material.emissive.copy(accentColor);
    book.material.emissiveIntensity = 0.6;
  }

  function resetBook(book) {
    if (book.userData.originalPosition) {
      book.position.copy(book.userData.originalPosition);
    }
    if (book.userData.originalColor) {
      book.material.color.copy(book.userData.originalColor);
    }
    if (book.userData.originalEmissive) {
      book.material.emissive.copy(book.userData.originalEmissive);
    }
    if (typeof book.userData.originalEmissiveIntensity !== "undefined") {
      book.material.emissiveIntensity = book.userData.originalEmissiveIntensity;
    }
  }

  function handlePointerMove(event) {
    if (!interactionReady) {
      return;
    }

    if (canvas && event.target !== canvas && !canvas.contains(event.target)) {
      if (hoveredBook) {
        resetBook(hoveredBook);
        hoveredBook = null;
      }
      return;
    }

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const [hit] = raycaster.intersectObjects(interactiveBooks, false);

    if (hit?.object !== hoveredBook) {
      if (hoveredBook) {
        resetBook(hoveredBook);
      }
      hoveredBook = hit?.object ?? null;
      if (hoveredBook) {
        highlightBook(hoveredBook);
      }
    }
  }

  function handlePointerLeave() {
    if (hoveredBook) {
      resetBook(hoveredBook);
      hoveredBook = null;
    }
  }

  async function prepareBookshelfInteractions() {
    const bookshelf = scene.getObjectByName("Bookshelf");
    if (!bookshelf) {
      return;
    }

    const books = Array.isArray(bookshelf.userData.books)
      ? bookshelf.userData.books
      : [];

    if (!books.length) {
      return;
    }

    try {
      const response = await fetch("/data/texts.json", { signal: abortController.signal });
      if (!response.ok) {
        throw new Error(`Unexpected ${response.status} response when fetching book metadata.`);
      }

      const metadata = await response.json();
      const availableMetadata = Array.isArray(metadata)
        ? metadata.filter((item) => item && typeof item.link === "string")
        : [];

      const count = Math.min(3, availableMetadata.length, books.length);
      if (!count) {
        return;
      }

      const shuffledBooks = shuffleArray(books);
      interactiveBooks = shuffledBooks.slice(0, count);

      interactiveBooks.forEach((book, index) => {
        const { title, link, accentColor, hoverOffset } = availableMetadata[index];
        book.userData.link = link;
        book.userData.title = title;
        book.userData.originalPosition = book.position.clone();
        book.userData.originalColor = book.material.color.clone();
        book.userData.originalEmissive = book.material.emissive.clone();
        book.userData.originalEmissiveIntensity = book.material.emissiveIntensity ?? 1;
        if (accentColor) {
          book.userData.accentColor = new THREE.Color(accentColor);
        }
        if (hoverOffset) {
          book.userData.hoverOffset = hoverOffset;
        }
      });

      interactionReady = true;
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Failed to prepare bookshelf interactions:", error);
      }
    }
  }

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerleave", handlePointerLeave);

  prepareBookshelfInteractions();

  return () => {
    abortController.abort();
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerleave", handlePointerLeave);
    if (hoveredBook) {
      resetBook(hoveredBook);
      hoveredBook = null;
    }
    interactiveBooks.forEach((book) => {
      if (book) {
        resetBook(book);
      }
    });
    interactionReady = false;
  };
}

function shuffleArray(items) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
