"use client";

import { useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "reicon-react";
import { Switch as AriaSwitch } from "react-aria-components";
import { SwitchTrack } from "@/components/atoms/switch";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "peach-ui-theme";
export const THEME_CHANGE_EVENT = "peach-ui-theme-change";

const THEME_TRANSITION_DURATION = 600;
const THEME_TRANSITION_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";
const THEME_TRANSITION_STYLE_ID = "peach-theme-transition-style";

type ThemeTransitionOrigin = { x: number; y: number };

type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
  skipTransition: () => void;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => ViewTransition;
};

let runningTransition: ViewTransition | null = null;
let themeTransitionSeq = 0;

function installThemeTransitionStyle(duration: number) {
  document.getElementById(THEME_TRANSITION_STYLE_ID)?.remove();

  const style = document.createElement("style");
  style.id = THEME_TRANSITION_STYLE_ID;
  style.textContent = `
    ::view-transition-new(root) {
      animation: peach-theme-fade-wipe ${duration}ms ${THEME_TRANSITION_EASING} both;
    }

    @keyframes peach-theme-fade-wipe {
      0% {
        clip-path: inset(0 100% 0 0);
        opacity: 0;
      }
      45% {
        opacity: 1;
      }
      100% {
        clip-path: inset(0 0 0 0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  return style;
}

function storedTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(
  theme: ThemeMode,
  { persist = true }: { persist?: boolean } = {},
) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
    }
  }
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
}

export async function applyThemeWithTransition(
  theme: ThemeMode,
  {
    duration = THEME_TRANSITION_DURATION,
  }: {
    origin?: ThemeTransitionOrigin | null;
    element?: HTMLElement | null;
    duration?: number;
  } = {},
) {
  if (typeof document === "undefined" || currentTheme() === theme) return;

  const transitionDocument = document as ViewTransitionDocument;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!transitionDocument.startViewTransition || reduceMotion) {
    applyTheme(theme);
    return;
  }

  const seq = ++themeTransitionSeq;
  try {
    runningTransition?.skipTransition();
  } catch {
  }

  document.documentElement.classList.add("theme-switching");
  const transitionStyle = installThemeTransitionStyle(duration);
  try {
    const transition = transitionDocument.startViewTransition(() => {
      flushSync(() => applyTheme(theme));
    });
    runningTransition = transition;

    await transition.ready;
    await transition.finished;
  } catch {
    if (seq === themeTransitionSeq && currentTheme() !== theme)
      applyTheme(theme);
  } finally {
    if (seq === themeTransitionSeq) {
      transitionStyle.remove();
      document.documentElement.classList.remove("theme-switching");
      runningTransition = null;
    }
  }
}

function currentTheme(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  const onThemeChange = () => onStoreChange();
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    applyTheme(event.newValue === "dark" ? "dark" : "light", {
      persist: false,
    });
  };
  window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribe, currentTheme, () => "light");
}

export interface ThemeToggleProps {
  collapsed?: boolean;
  appearance?: "sidebar" | "segmented" | "sidebar-segmented";
  className?: string;
  size?: "small" | "medium";
  transitionDuration?: number;
}

export function ThemeToggle({
  collapsed = false,
  appearance = "sidebar",
  className,
  size = "medium",
  transitionDuration = THEME_TRANSITION_DURATION,
}: ThemeToggleProps) {
  const theme = useThemeMode();
  const dark = theme === "dark";
  const switchRef = useRef<HTMLLabelElement | null>(null);
  const pointerOriginRef = useRef<ThemeTransitionOrigin | null>(null);

  useMountEffect(() => applyTheme(storedTheme(), { persist: false }));

  if (appearance === "segmented" || appearance === "sidebar-segmented") {
    const small = size === "small";
    const sidebarSurface = appearance === "sidebar-segmented";
    const options = [
      { mode: "light" as const, label: "Use light mode", Icon: Sun },
      { mode: "dark" as const, label: "Use dark mode", Icon: Moon },
    ];

    return (
      <div
        role="group"
        aria-label="Theme"
        className={cx(
          "relative inline-flex w-fit items-center gap-1 rounded-full p-1",
          small && "gap-0.5 p-0.5",
          sidebarSurface ? "bg-hover-2" : "bg-canvas",
          className,
        )}
      >
        <span
          aria-hidden
          className={cx(
            "pointer-events-none absolute top-1 start-1 size-8 rounded-full bg-surface",
            "shadow-xs transition-transform duration-200 ease",
            small && "top-0.5 start-0.5 size-6",
            dark && (small ? "translate-x-6.5" : "translate-x-9"),
          )}
        />
        {options.map(({ mode, label, Icon }) => {
          const selected = theme === mode;
          return (
            <button
              key={mode}
              type="button"
              aria-label={label}
              aria-pressed={selected}
              title={mode === "light" ? "Light mode" : "Dark mode"}
              onClick={(event) => {
                if (selected) return;
                const pointerOrigin =
                  event.clientX === 0 && event.clientY === 0
                    ? null
                    : { x: event.clientX, y: event.clientY };
                void applyThemeWithTransition(mode, {
                  origin: pointerOrigin,
                  element: event.currentTarget,
                  duration: transitionDuration,
                });
              }}
              className={cx(
                "relative z-10 grid size-8 cursor-pointer place-items-center rounded-full outline-none",
                small && "size-6",
                "transition-colors duration-150 ease",
                "focus-visible:ring-2 focus-visible:ring-accent",
                selected ? "text-ink" : "text-ink-2 hover:text-ink",
              )}
            >
              <Icon className={small ? "size-3.5" : "size-4"} aria-hidden />
            </button>
          );
        })}
      </div>
    );
  }

  if (collapsed) {
    const Icon = dark ? Sun : Moon;
    return (
      <button
        type="button"
        aria-label={dark ? "Use light mode" : "Use dark mode"}
        aria-pressed={dark}
        title={dark ? "Light mode" : "Dark mode"}
        onClick={(event) => {
          const pointerOrigin =
            event.clientX === 0 && event.clientY === 0
              ? null
              : { x: event.clientX, y: event.clientY };
          void applyThemeWithTransition(dark ? "light" : "dark", {
            origin: pointerOrigin,
            element: event.currentTarget,
            duration: transitionDuration,
          });
        }}
        className={cx(
          "flex size-9 cursor-pointer items-center justify-center rounded-2lg",
          "text-ink-2 transition-colors duration-150 ease",
          "hover:bg-hover hover:text-ink",
          "outline-none focus-visible:ring-2 focus-visible:ring-accent",
          className,
        )}
      >
        <Icon className="size-5" aria-hidden />
      </button>
    );
  }

  return (
    <AriaSwitch
      ref={switchRef}
      isSelected={dark}
      onPointerDown={(event) => {
        pointerOriginRef.current = { x: event.clientX, y: event.clientY };
      }}
      onChange={(selected) => {
        const origin = pointerOriginRef.current;
        pointerOriginRef.current = null;
        void applyThemeWithTransition(selected ? "dark" : "light", {
          origin,
          element: switchRef.current,
          duration: transitionDuration,
        });
      }}
      aria-label="Dark mode"
      className={({ isFocusVisible }) =>
        cx(
          "flex w-full cursor-pointer items-center justify-between rounded-2lg p-2",
          "transition-colors duration-150 ease hover:bg-hover",
          isFocusVisible && "ring-2 ring-inset ring-accent",
          className,
        )
      }
    >
      {(state) => (
        <>
          <span className="flex min-w-0 items-center gap-2">
            <Moon className="size-5 shrink-0 text-ink-2" aria-hidden />
            <span className="text-body-medium text-ink-2">Dark mode</span>
          </span>
          <SwitchTrack state={state} size="sm" shape="pill" />
        </>
      )}
    </AriaSwitch>
  );
}
