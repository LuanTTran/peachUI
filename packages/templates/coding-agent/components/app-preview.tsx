"use client";

/**
 * Fake browser preview of the Grove storefront.
 * The promo banner mounts once the diff is approved.
 */

import { Cart, Leaf, Refresh, Search, Truck } from "reicon-react";
import { blockEaseCss, fadeUpStyle } from "@/components/lib/block-motion";
import { cx } from "@/lib/utils";

const PRODUCTS = [
  { id: "monstera", name: "Monstera deliciosa", price: "$42", tile: "bg-canvas text-ink-3" },
  { id: "fiddle", name: "Fiddle-leaf fig", price: "$68", tile: "bg-canvas text-ink-3" },
  { id: "snake", name: "Snake plant", price: "$34", tile: "bg-canvas text-ink-3" },
  { id: "pilea", name: "Pilea peperomioides", price: "$28", tile: "bg-canvas text-ink-3" },
] as const;

export function AppPreview({ banner }: { banner: boolean }) {
  return (
    <div className="flex min-h-full flex-col overflow-hidden bg-surface">
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <span className="flex gap-1" aria-hidden>
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
        </span>
        <span className="mx-auto flex min-w-0 max-w-[70%] items-center gap-1.5 rounded-full bg-inset px-3 py-1 font-mono text-caption-2-regular text-ink-2 shadow-hairline">
          <span className="truncate">grove.peach.dev</span>
        </span>
        <button
          type="button"
          aria-label="Reload preview"
          className="flex size-6 items-center justify-center rounded-chip text-ink-3 transition-colors hover:bg-hover hover:text-ink"
        >
          <Refresh className="size-3" />
        </button>
      </div>

      {/* storefront */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* promo banner — mounts on approve */}
        <div
          className="grid transition-[grid-template-rows] duration-500"
          style={{
            gridTemplateRows: banner ? "1fr" : "0fr",
            transitionTimingFunction: blockEaseCss,
          }}
        >
          <div className="overflow-hidden">
            <p
              className="flex items-center justify-center gap-1.5 bg-accent px-3 py-1.5 text-caption-1-medium text-on-accent"
              role="status"
            >
              <Truck className="size-3.5" aria-hidden />
              Free shipping on orders over $75
            </p>
          </div>
        </div>

        {/* site header */}
        <header className="flex items-center gap-4 border-b border-line px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-body-2-bold tracking-tight text-ink">
            <Leaf className="size-4 text-green" aria-hidden />
            Grove
          </span>
          <nav className="hidden items-center gap-3 text-caption-1-regular text-ink-2 sm:flex" aria-label="Preview navigation">
            <span className="text-caption-1-medium text-ink">Shop</span>
            <span>Collections</span>
            <span>About</span>
          </nav>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-field px-2.5 py-1 text-caption-2-regular text-ink-3 shadow-hairline">
            <Search className="size-3" aria-hidden />
            Search plants
          </span>
          <span className="relative flex size-6 items-center justify-center text-ink-2">
            <Cart className="size-3.5" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-caption-2-bold text-on-accent">
              2
            </span>
          </span>
        </header>

        {/* hero */}
        <div className="px-4 py-4">
          <h3 className="text-body-bold text-ink">New arrivals</h3>
          <p className="mt-0.5 text-caption-1-regular text-ink-3">Fresh from the greenhouse this week</p>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {PRODUCTS.map((product, i) => (
              <div key={product.id} className="min-w-0" style={{ ...fadeUpStyle, animationDelay: `${i * 60}ms` }}>
                <div
                  className={cx(
                    "flex aspect-[4/3] items-center justify-center rounded-panel shadow-hairline",
                    product.tile,
                  )}
                >
                  <Leaf className="size-6 opacity-50" aria-hidden />
                </div>
                <div className="mt-1.5 flex items-baseline justify-between gap-2 px-0.5">
                  <span className="truncate text-caption-1-medium text-ink">{product.name}</span>
                  <span className="shrink-0 text-caption-1-regular tabular-nums text-ink-2">{product.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
