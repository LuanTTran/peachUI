/**
 * Demo copy and seed data for `DataTableExample` presets.
 * Commerce = primitive catalog default; directory = record ledger block.
 */

import { avatarArtForKey, type AvatarArtId } from "@/components/atoms/avatar-art";

export type DataTableDemoPreset = "commerce" | "directory";

type StatusColor = "lime" | "yellow" | "rose" | "cyan";
export type DemoStatus = { label: string; color: StatusColor };

export type DemoTableRow = {
  id: string;
  name: string;
  avatarArt: AvatarArtId;
  initialsColor: "neutral" | "blue";
  purchase: "completed" | "waiting" | "processing";
  status: DemoStatus;
  product: string;
  region: string;
  price: number;
  updated: string;
  updatedTs: number;
};

export type DataTableCopy = {
  resultsLead: string;
  resultsCount: (n: number) => string;
  filterMetricAria: string;
  filterSegmentAria: string;
  filterGroupAria: string;
  filterSegmentAll: string;
  filterGroupAll: string;
  searchAria: string;
  searchPlaceholder: string;
  tableAria: string;
  selectPageAria: string;
  emptyState: string;
  nameColumn: string;
  purchaseColumn: string;
  statusColumn: string;
  updatedColumn: string;
  priceColumn: string;
  actionsColumn: string;
  purchaseSelectAria: (name: string) => string;
  purchaseOptions: { completed: string; waiting: string; processing: string };
  rowDelete: string;
  rowEdit: string;
  moreMenuTooltip: string;
  moreMenuAria: (name: string) => string;
  moreMenuItems: readonly { label: string }[];
  formatMetric: (n: number) => string;
  densityAria: string;
  densityNormal: string;
  densityCompact: string;
};

export const COMMERCE_COPY: DataTableCopy = {
  resultsLead: "Total results",
  resultsCount: (n) => `${n.toLocaleString()} customers`,
  filterMetricAria: "Filter by price",
  filterSegmentAria: "Filter by product",
  filterGroupAria: "Filter by region",
  filterSegmentAll: "All products",
  filterGroupAll: "All regions",
  searchAria: "Search customers",
  searchPlaceholder: "Search",
  tableAria: "Customers",
  selectPageAria: "Select all customers on this page",
  emptyState: "No customers match your filters.",
  nameColumn: "Customer name",
  purchaseColumn: "Purchase",
  statusColumn: "Status",
  updatedColumn: "Last updated",
  priceColumn: "Price",
  actionsColumn: "Actions",
  purchaseSelectAria: (name) => `Purchase status for ${name}`,
  purchaseOptions: {
    completed: "Completed",
    waiting: "Waiting",
    processing: "Processing",
  },
  rowDelete: "Delete",
  rowEdit: "Edit",
  moreMenuTooltip: "More actions",
  moreMenuAria: (name) => `More actions for ${name}`,
  moreMenuItems: [
    { label: "View profile" },
    { label: "Duplicate row" },
    { label: "Download invoice" },
    { label: "Archive customer" },
  ],
  formatMetric: (n) => (n >= 1000 ? `$${Math.floor(n / 1000)}.${String(n % 1000).padStart(3, "0")}` : `$${n}`),
  densityAria: "Table density",
  densityNormal: "Normal",
  densityCompact: "Compact",
};

export const DIRECTORY_COPY: DataTableCopy = {
  resultsLead: "Filtered rows",
  resultsCount: (n) => `${n.toLocaleString()} ${n === 1 ? "person" : "people"}`,
  filterMetricAria: "Filter by seat count",
  filterSegmentAria: "Filter by product area",
  filterGroupAria: "Filter by group",
  filterSegmentAll: "All areas",
  filterGroupAll: "All groups",
  searchAria: "Search people by name",
  searchPlaceholder: "Name",
  tableAria: "Workspace access",
  selectPageAria: "Select everyone on this page",
  emptyState: "No one matches these filters. Clear a filter or try another name.",
  nameColumn: "Name",
  purchaseColumn: "Access",
  statusColumn: "Status",
  updatedColumn: "Last active",
  priceColumn: "Seats",
  actionsColumn: "Actions",
  purchaseSelectAria: (name) => `Access state for ${name}`,
  purchaseOptions: {
    completed: "Active",
    waiting: "Revoking",
    processing: "Invite pending",
  },
  rowDelete: "Remove access",
  rowEdit: "Edit role",
  moreMenuTooltip: "More actions",
  moreMenuAria: (name) => `More actions for ${name}`,
  moreMenuItems: [
    { label: "Open profile" },
    { label: "Copy email" },
    { label: "Export activity" },
    { label: "Suspend access" },
  ],
  formatMetric: (n) => (n === 1 ? "1 seat" : `${n} seats`),
  densityAria: "Table density",
  densityNormal: "Comfortable",
  densityCompact: "Dense",
};

const COMMERCE_STATUSES: DemoStatus[] = [
  { label: "Shipped", color: "lime" },
  { label: "Delivery waiting", color: "yellow" },
  { label: "Delivery failed", color: "rose" },
  { label: "Confirmed", color: "cyan" },
];

const DIRECTORY_STATUSES: DemoStatus[] = [
  { label: "Active", color: "lime" },
  { label: "Invite sent", color: "yellow" },
  { label: "Access paused", color: "rose" },
  { label: "Offboarded", color: "cyan" },
];

const COMMERCE_PRODUCTS = ["Sneakers", "Backpack", "Smart watch", "Headphones", "Sunglasses", "Wallet"];
const DIRECTORY_SEGMENTS = ["Agent console", "Component catalog", "Billing", "Audit trail", "Integrations", "API keys"];

const COMMERCE_REGIONS = ["North America", "Europe", "Asia", "Oceania"];
const DIRECTORY_GROUPS = ["Platform", "Design systems", "Revenue", "Security"];

const NAMED_COMMERCE = [
  "John Clarkson",
  "Aspen Lubin",
  "Michael Ekstrom",
  "Kianna Vaccaro",
  "Livia Saris",
  "Jaydon Aminoff",
  "Maria Lubin",
  "Ann Press",
];

const NAMED_DIRECTORY = [
  "Rina Okonkwo",
  "Elias Mercer",
  "Priya Nandakumar",
  "Jonah Weiss",
  "Camille Duarte",
  "Noah Bergström",
  "Aisha Rahman",
  "Leo Hartmann",
];

const FIRST_NAMES = ["Marcus", "Cheyenne", "Alfredo", "Talan", "Roger", "Cristofer", "Emery", "Kadin", "Nolan", "Ruben", "Skylar", "Hanna", "Corey", "Miracle", "Zaire", "Cooper", "Leilani", "Alena", "Terry", "Jaxson"];
const LAST_NAMES = ["Culhane", "Herwitz", "Septimus", "Bergson", "Curtis", "Vetrovs", "Rhiel", "Dokidis", "Kenter", "Stanton", "Baptista", "Workman", "Torff", "Calzoni", "Rosser", "Geidt", "Bator", "Vaccaro", "Lipshutz", "Botosh"];

const DIRECTORY_FIRST = ["Sable", "Imani", "Theo", "Mei", "Anders", "Zola", "Ren", "Hugo", "Nadia", "Kai"];
const DIRECTORY_LAST = ["Osei", "Lindqvist", "Menon", "Carver", "Fontaine", "Ibarra", "Petrov", "Nguyen", "Sato", "Kowalski"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function makeRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type MetricBucket = { id: string; label: string; test: (p: number) => boolean };

export const COMMERCE_METRIC_BUCKETS: MetricBucket[] = [
  { id: "all", label: "All prices", test: () => true },
  { id: "under-100", label: "Under $100", test: (p) => p < 100 },
  { id: "100-500", label: "$100 – $500", test: (p) => p >= 100 && p <= 500 },
  { id: "500-1000", label: "$500 – $1,000", test: (p) => p > 500 && p <= 1000 },
  { id: "over-1000", label: "Over $1,000", test: (p) => p > 1000 },
];

export const DIRECTORY_METRIC_BUCKETS: MetricBucket[] = [
  { id: "all", label: "All seat counts", test: () => true },
  { id: "1-5", label: "1–5 seats", test: (p) => p >= 1 && p <= 5 },
  { id: "6-20", label: "6–20 seats", test: (p) => p >= 6 && p <= 20 },
  { id: "21-50", label: "21–50 seats", test: (p) => p >= 21 && p <= 50 },
  { id: "51-plus", label: "51+ seats", test: (p) => p > 50 },
];

function buildRows(config: {
  seed: number;
  count: number;
  statuses: DemoStatus[];
  segments: string[];
  groups: string[];
  metricRange: [number, number];
  named: string[];
  firstNames: string[];
  lastNames: string[];
  purchaseRule: (status: DemoStatus, rng: () => number) => DemoTableRow["purchase"];
}): DemoTableRow[] {
  const rng = makeRng(config.seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];
  const [minMetric, maxMetric] = config.metricRange;

  return Array.from({ length: config.count }, (_, i) => {
    const status = pick(config.statuses);
    const purchase = config.purchaseRule(status, rng);
    const price = minMetric + Math.floor(rng() * (maxMetric - minMetric + 1));
    const monthIdx = Math.floor(rng() * 12);
    const day = 1 + Math.floor(rng() * 28);
    const updated = `${MONTHS[monthIdx]} ${String(day).padStart(2, "0")}, 2026`;
    const updatedTs = new Date(2026, monthIdx, day).getTime();
    const base = {
      id: String(i),
      purchase,
      status,
      product: pick(config.segments),
      region: pick(config.groups),
      price,
      updated,
      updatedTs,
    };
    const name =
      i < config.named.length
        ? config.named[i]
        : `${pick(config.firstNames)} ${pick(config.lastNames)}`;
    return {
      ...base,
      name,
      avatarArt: avatarArtForKey(name),
      initialsColor:
        i < config.named.length ? "neutral" : rng() > 0.5 ? "blue" : "neutral",
    };
  });
}

export const COMMERCE_ROWS = buildRows({
  seed: 42,
  count: 16,
  statuses: COMMERCE_STATUSES,
  segments: COMMERCE_PRODUCTS,
  groups: COMMERCE_REGIONS,
  metricRange: [20, 3999],
  named: NAMED_COMMERCE,
  firstNames: FIRST_NAMES,
  lastNames: LAST_NAMES,
  purchaseRule: (status, rng) =>
    rng() < 0.24
      ? "processing"
      : status.label === "Shipped" || status.label === "Confirmed"
        ? "completed"
        : "waiting",
});

export const DIRECTORY_ROWS = buildRows({
  seed: 91,
  count: 10,
  statuses: DIRECTORY_STATUSES,
  segments: DIRECTORY_SEGMENTS,
  groups: DIRECTORY_GROUPS,
  metricRange: [1, 64],
  named: NAMED_DIRECTORY,
  firstNames: DIRECTORY_FIRST,
  lastNames: DIRECTORY_LAST,
  purchaseRule: (status, rng) => {
    if (status.label === "Invite sent") return "processing";
    if (status.label === "Offboarded" || status.label === "Access paused") return "waiting";
    if (rng() < 0.08) return "processing";
    return "completed";
  },
});

export function copyForPreset(preset: DataTableDemoPreset): DataTableCopy {
  return preset === "directory" ? DIRECTORY_COPY : COMMERCE_COPY;
}

export function rowsForPreset(preset: DataTableDemoPreset): DemoTableRow[] {
  return preset === "directory" ? DIRECTORY_ROWS : COMMERCE_ROWS;
}

export function metricBucketsForPreset(preset: DataTableDemoPreset): MetricBucket[] {
  return preset === "directory" ? DIRECTORY_METRIC_BUCKETS : COMMERCE_METRIC_BUCKETS;
}

export function segmentsForPreset(preset: DataTableDemoPreset): string[] {
  return preset === "directory" ? DIRECTORY_SEGMENTS : COMMERCE_PRODUCTS;
}

export function groupsForPreset(preset: DataTableDemoPreset): string[] {
  return preset === "directory" ? DIRECTORY_GROUPS : COMMERCE_REGIONS;
}
