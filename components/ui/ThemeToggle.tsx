"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";

const themeConfig = {
  light: { icon: Sun, label: "Clair", next: "dark" as const },
  dark: { icon: Moon, label: "Sombre", next: "system" as const },
  system: { icon: Monitor, label: "Système", next: "light" as const },
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const config = themeConfig[theme];
  const Icon = config.icon;

  return (
    <button
      id="theme-toggle"
      onClick={() => setTheme(config.next)}
      className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 group"
      title={`Thème : ${config.label}`}
      aria-label={`Changer le thème (actuel : ${config.label})`}
    >
      <Icon className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110" />

      {/* Tooltip */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] font-medium rounded-md bg-foreground text-background opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {config.label}
      </span>
    </button>
  );
}
