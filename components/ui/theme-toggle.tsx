"use client"

import { useTheme } from "@/components/providers/ThemeProvider"
import { Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

const themeConfig = {
  light: { icon: Sun, label: "Clair", next: "dark" as const },
  dark: { icon: Moon, label: "Sombre", next: "system" as const },
  system: { icon: Monitor, label: "Système", next: "light" as const },
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const config = themeConfig[theme]
  const Icon = config.icon

  return (
    <Button
      id="theme-toggle"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(config.next)}
      title={`Thème : ${config.label}`}
      aria-label={`Changer le thème (actuel : ${config.label})`}
      data-slot="theme-toggle"
    >
      <Icon className="size-[18px] transition-transform duration-300 group-hover:scale-110" />
    </Button>
  )
}

export default ThemeToggle
