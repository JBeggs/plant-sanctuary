import { cache } from 'react'
import { serverNewsApi } from '@/lib/api-server'

export type SiteSettingRow = { key: string; value: string; type?: string }

function parseSetting(row: SiteSettingRow): unknown {
  if (!row) return null
  try {
    return row.type === 'json' ? JSON.parse(row.value) : row.value
  } catch {
    return row.value
  }
}

export const getSiteSettingsRows = cache(async (): Promise<SiteSettingRow[]> => {
  try {
    const raw: unknown = await serverNewsApi.siteSettings.list()
    if (Array.isArray(raw)) return raw as SiteSettingRow[]
    if (raw && typeof raw === 'object' && 'results' in raw) {
      const r = (raw as { results?: SiteSettingRow[] }).results
      return Array.isArray(r) ? r : []
    }
    return []
  } catch {
    return []
  }
})

export const getSiteSettingsMap = cache(async (): Promise<Record<string, unknown>> => {
  const rows = await getSiteSettingsRows()
  const map: Record<string, unknown> = {}
  for (const row of rows) {
    map[row.key] = parseSetting(row)
  }
  return map
})
