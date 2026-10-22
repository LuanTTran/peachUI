/**
 * Shared fixtures for the "Peach" fictional world across templates.
 * See docs/TEMPLATES.md §2.
 */

export type PeachPerson = {
  id: string;
  name: string;
  handle: string;
  initials: string;
};

export const PEOPLE: PeachPerson[] = [
  { id: "mara", name: "Mara Okafor", handle: "mara.okafor", initials: "MO" },
  { id: "jonas", name: "Jonas Reyes", handle: "jonas.reyes", initials: "JR" },
  { id: "suki", name: "Suki Tan", handle: "suki.tan", initials: "ST" },
  { id: "devon", name: "Devon Lau", handle: "devon.lau", initials: "DL" },
];

export const AGENT = {
  name: "Peach Agent",
  handle: "peach-agent",
} as const;

export const REPOS = [
  { id: "peach", name: "peach-ui/peach", branch: "main" },
  { id: "grove", name: "peach-ui/grove", branch: "main" },
  { id: "stone", name: "peach-ui/stone", branch: "main" },
] as const;

export type RepoId = (typeof REPOS)[number]["id"];
