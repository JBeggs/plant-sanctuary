'use client'

import { useTheme, THEMES, THEME_META, type Theme } from '@/contexts/ThemeContext'
import { Leaf, Trees, Moon } from 'lucide-react'

const ICONS: Record<Theme, React.ComponentType<{ className?: string }>> = {
  classic: Leaf,
  'dark-green': Trees,
  dark: Moon,
}

interface ThemeToggleProps {
  variant?: 'icon' | 'full'
  className?: string
  label?: string
}

export default function ThemeToggle({
  variant = 'icon',
  className,
  label = 'Theme',
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={[
        'inline-flex items-center gap-1 rounded-full border p-1',
        'bg-surface-raised border-border',
        className ?? '',
      ].join(' ')}
    >
      {THEMES.map((id) => {
        const Icon = ICONS[id]
        const meta = THEME_META[id]
        const active = id === theme
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={meta.label}
            title={`${meta.label} — ${meta.description}`}
            onClick={() => setTheme(id)}
            className={[
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              'transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-primary',
              active
                ? 'bg-forest-primary text-[rgb(var(--color-text-inverse))] shadow-sm'
                : 'text-text-muted hover:text-text',
            ].join(' ')}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {variant === 'full' && <span>{meta.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
