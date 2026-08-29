"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem("theme");
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lecture hydratation-safe : snapshot nulle côté serveur, valeur réelle
  // (localStorage / préférence système) après hydratation côté client.
  const theme = useSyncExternalStore<Theme>(
    () => () => {},
    readStoredTheme,
    () => "system",
  );

  const resolvedTheme = useSyncExternalStore<"light" | "dark">(
    () => () => {},
    () => {
      const stored = readStoredTheme();
      return stored === "system" ? getSystemTheme() : stored;
    },
    () => "light",
  );

  const [, forceRender] = useReducer((count: number) => count + 1, 0);

  const setTheme = useCallback((newTheme: Theme) => {
    if (newTheme !== "light" && newTheme !== "dark" && newTheme !== "system") {
      return;
    }
    try {
      localStorage.setItem("theme", newTheme);
    } catch {
      // Ignore si le stockage est indisponible
    }
    applyTheme(newTheme);
    // Nouveau rendu : useSyncExternalStore relit la valeur stockée.
    forceRender();
  }, []);

  // Synchronise le thème sur le DOM et écoute les changements de
  // préférence système (pas de setState : uniquement des effets externes).
  useEffect(() => {
    applyTheme(theme);

    if (typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
        forceRender();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}