import { readFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_ROOT = path.join(process.cwd(), "components");

const ALLOWED_PREFIXES = ["components/atoms/", "components/primitives/", "components/blocks/"];

/** Read a component source file for catalog copy (under `components/`). */
export async function readComponentSource(sourcePath: string): Promise<string> {
  const allowed = ALLOWED_PREFIXES.some((prefix) => sourcePath.startsWith(prefix));
  if (!allowed) {
    throw new Error("Source path must be under components/atoms, primitives, or blocks");
  }
  const absolute = path.normalize(path.join(process.cwd(), "components", sourcePath.slice("components/".length)));
  if (!absolute.startsWith(ALLOWED_ROOT)) {
    throw new Error("Source path escapes components/");
  }
  return readFile(absolute, "utf8");
}
