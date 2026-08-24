"use client";

const KEY = "nashemann_theme";
export type Theme = "dark" | "light";

// In-app browsers (WhatsApp, Instagram, Facebook -- extremely common entry
// points for mobile customers here) frequently block or throw on
// localStorage access. An uncaught throw here (this used to call
// window.localStorage directly with no guard) crashes the nearest error
// boundary -- and since ThemeToggle renders in the navbar on every page, it
// took down the entire site for those visitors, not just theme switching.
export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    return (window.localStorage.getItem(KEY) as Theme) || "dark";
  } catch {
    return "dark";
  }
}

export function setStoredTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {
    // Theme still applies for this page view; just doesn't persist.
  }
}

/** Inlined verbatim into <head> before first paint to avoid a flash of the wrong theme. */
export const THEME_INIT_SCRIPT = `
(function() {
  try {
    var t = localStorage.getItem('${KEY}') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;
