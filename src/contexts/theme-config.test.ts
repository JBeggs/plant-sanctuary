import { describe, it, expect } from 'vitest'
import {
  THEMES,
  DEFAULT_THEME,
  THEME_META,
  THEME_BOOTSTRAP_SCRIPT,
  isTheme,
} from './theme-config'

describe('theme-config', () => {
  it('defines classic as default', () => {
    expect(DEFAULT_THEME).toBe('classic')
  })

  it('includes all three themes', () => {
    expect(THEMES).toEqual(['classic', 'dark-green', 'dark'])
  })

  it('isTheme validates theme ids', () => {
    expect(isTheme('classic')).toBe(true)
    expect(isTheme('dark-green')).toBe(true)
    expect(isTheme('dark')).toBe(true)
    expect(isTheme('heritage')).toBe(false)
    expect(isTheme(null)).toBe(false)
  })

  it('THEME_META has labels for every theme', () => {
    for (const id of THEMES) {
      expect(THEME_META[id].label).toBeTruthy()
      expect(THEME_META[id].id).toBe(id)
    }
  })

  it('bootstrap script references all theme ids', () => {
    for (const id of THEMES) {
      expect(THEME_BOOTSTRAP_SCRIPT).toContain(id)
    }
    expect(THEME_BOOTSTRAP_SCRIPT).toContain('data-theme')
    expect(THEME_BOOTSTRAP_SCRIPT).toContain(DEFAULT_THEME)
  })
})
