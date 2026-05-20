/**
 * Theme constants safe to import from server and client modules.
 */

export const THEMES = ['classic', 'dark-green', 'dark'] as const
export type Theme = (typeof THEMES)[number]

export const DEFAULT_THEME: Theme = 'classic'

export const THEME_META: Record<
  Theme,
  { id: Theme; label: string; description: string }
> = {
  classic: {
    id: 'classic',
    label: 'Classic',
    description: 'Light cream background with forest green accents',
  },
  'dark-green': {
    id: 'dark-green',
    label: 'Dark green',
    description: 'Deep forest tones with bright green highlights',
  },
  dark: {
    id: 'dark',
    label: 'Dark',
    description: 'Charcoal surfaces with green accent details',
  },
}

export const THEME_COOKIE_KEY = 'site_theme'
export const THEME_STORAGE_KEY = 'site_theme'

export function isTheme(v: unknown): v is Theme {
  return typeof v === 'string' && (THEMES as readonly string[]).includes(v)
}

export const THEME_BOOTSTRAP_SCRIPT = `
(function(){try{
  var m=document.cookie.match(/(?:^|; )${THEME_COOKIE_KEY}=([^;]+)/);
  var t=m?decodeURIComponent(m[1]):null;
  if(!t){try{t=localStorage.getItem('${THEME_STORAGE_KEY}');}catch(e){}}
  var allowed=${JSON.stringify(THEMES)};
  if(!t||allowed.indexOf(t)===-1)t='${DEFAULT_THEME}';
  document.documentElement.setAttribute('data-theme',t);
}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME}');}})();
`
