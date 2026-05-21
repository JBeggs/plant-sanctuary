/**
 * BCP 47 tag for `<html lang>` and `Intl` date formatting.
 */
export function resolveLocale(company?: { localeTag?: string }): string {
  const t = (company?.localeTag || 'en-ZA').trim()
  return t || 'en-ZA'
}
