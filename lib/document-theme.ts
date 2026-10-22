export type DocumentTheme = "light" | "dark";

export function readDocumentTheme(): DocumentTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function subscribeDocumentTheme(onStoreChange: () => void) {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(() => onStoreChange());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
