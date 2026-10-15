import { Content, seed, kinds } from "./content";
// Replace this adapter with Supabase queries later; keep views independent of persistence.
export const STORAGE_KEY = "poetic-melodies-v1";
export function validateContent(value: unknown): value is Content {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return kinds.every(
    (k) =>
      Array.isArray(v[k]) &&
      new Set(
        v[k].map((x: unknown) =>
          x && typeof x === "object" ? (x as { id?: unknown }).id : undefined,
        ),
      ).size === v[k].length &&
      v[k].every((x: unknown) => {
        if (!x || typeof x !== "object") return false;
        const i = x as Record<string, unknown>;
        return (
          typeof i.id === "string" &&
          /^[a-zA-Z0-9_-]+$/.test(i.id) &&
          typeof i.title === "string" &&
          typeof i.en === "string" &&
          typeof i.description === "string" &&
          ["draft", "published"].includes(String(i.status)) &&
          [
            "text",
            "descriptionEn",
            "category",
            "subcategory",
            "poet",
            "series",
            "album",
            "date",
            "duration",
          ].every(
            (key) => i[key] === undefined || typeof i[key] === "string",
          ) &&
          (i.format === undefined ||
            ["audio", "video", "text"].includes(String(i.format))) &&
          (!i.src ||
            (typeof i.src === "string" &&
              /^(https:\/\/|\/media\/|data:(audio|video|image)\/)/.test(i.src)))
        );
      }),
  );
}
export const localRepository = {
  load(): Content {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(seed);
    const parsed = JSON.parse(raw);
    if (!validateContent(parsed))
      throw Error("Invalid saved content. Export or reset your local library.");
    return parsed;
  },
  save(content: Content) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  },
};
