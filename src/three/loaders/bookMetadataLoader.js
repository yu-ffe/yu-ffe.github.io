const dataPath = `${import.meta.env.BASE_URL ?? "/"}data/texts.json`;

export async function loadBookMetadata() {
  try {
    const response = await fetch(dataPath, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Unexpected ${response.status} response when fetching book metadata.`);
    }

    const raw = await response.json();
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .filter((entry) => typeof entry?.link === "string" && entry.link.length > 0)
      .map((entry) => ({
        link: entry.link,
        text: entry.text ?? "",
        title: entry.title ?? entry.text ?? "",
        style: entry.style ?? entry.theme ?? null,
      }));
  } catch (error) {
    console.error("Failed to load book metadata:", error);
    return [];
  }
}
