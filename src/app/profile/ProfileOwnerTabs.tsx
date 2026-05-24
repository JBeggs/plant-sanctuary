'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Clock,
  Settings,
  Save,
  Loader2,
  MapPin,
  CreditCard,
  Truck,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from 'lucide-react'
import { ecommerceApi, newsApi, getApiErrorMessage } from '@/lib/api'
import {
  IntegrationSettings,
  IntegrationSettingsUpdatePayload,
} from '@/lib/types'
import { useToast } from '@/contexts/ToastContext'
import {
  CUSTOM_CONTACT_EMAIL_SETTING,
  PLATFORM_CONTACT_EMAIL,
  isCustomContactEmailEnabled,
} from '@/lib/platform-contact-email'

const MASK_PREFIX = '•'
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

type TabId = 'business' | 'site' | 'integrations'

export default function ProfileOwnerTabs({
  activeTab,
  companyId,
}: {
  activeTab: TabId
  companyId: string
}) {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [company, setCompany] = useState<Record<string, unknown> | null>(null)
  const [companyForm, setCompanyForm] = useState({
    logo: '',
    name: '',
    email: '',
    phone: '',
    website: '',
    address_street: '',
    address_city: '',
    address_province: '',
    address_postal_code: '',
    address_country: 'ZA',
    description: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    google_analytics_id: '',
    facebook_pixel_id: '',
    legal_name: '',
    registration_number: '',
    tax_number: '',
    business_hours: {} as Record<string, string>,
  })
  const [updatingCompany, setUpdatingCompany] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [removingLogo, setRemovingLogo] = useState(false)
  const [siteSettings, setSiteSettings] = useState<Record<string, { id: string; value: string; type: string }>>({})
  const [siteSettingsValues, setSiteSettingsValues] = useState<Record<string, string>>({})
  const [customContactEmailEnabled, setCustomContactEmailEnabled] = useState(false)
  const [updatingSiteSettings, setUpdatingSiteSettings] = useState(false)
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings | null>(null)
  const [integrationForm, setIntegrationForm] = useState<IntegrationSettingsUpdatePayload & Record<string, unknown>>({})
  const [updatingIntegration, setUpdatingIntegration] = useState(false)
  const [secretVisible, setSecretVisible] = useState<Record<string, boolean>>({})
  const [countries, setCountries] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    ecommerceApi.countries.list().then((res: unknown) => {
      const r = res as { data?: { id: number; name: string }[] }
      const list = r?.data ?? (Array.isArray(res) ? res : [])
      setCountries((list as { id: number; name: string }[]).filter((c) => c?.name))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    newsApi.siteSettings.list().then((data: unknown) => {
      const arr = Array.isArray(data) ? data : ((data as { results?: unknown[] })?.results || [])
      const byKey: Record<string, { id: string; value: string; type: string }> = {}
      const vals: Record<string, string> = {}
      ;(arr as { key: string; id: string; value?: string; type?: string }[]).forEach((s) => {
        byKey[s.key] = { id: s.id, value: s.value ?? '', type: s.type || 'string' }
        vals[s.key] = s.value ?? ''
      })
      setSiteSettings(byKey)
      setSiteSettingsValues(vals)
      setCustomContactEmailEnabled(isCustomContactEmailEnabled(vals))
    }).catch(() => {})
  }, [companyId])

  useEffect(() => {
    ecommerceApi.companies.get(companyId).then((c: unknown) => {
      const row = c as Record<string, unknown>
      setCompany(row)
      const logo = row?.logo as { file_url?: string } | undefined
      const hours = row?.business_hours as Record<string, unknown> | undefined
      const out: Record<string, string> = {}
      if (hours && typeof hours === 'object') {
        for (const [day, val] of Object.entries(hours)) {
          if (typeof val === 'string') out[day] = val
          else if (val && typeof val === 'object' && !Array.isArray(val)) {
            const o = val as { open?: string; close?: string; closed?: boolean }
            out[day] = o.closed ? 'Closed' : o.open && o.close ? `${o.open} - ${o.close}` : ''
          }
        }
      }
      setCompanyForm({
        logo: logo?.file_url || String(row?.logo_url || ''),
        name: String(row?.name || ''),
        email: String(row?.email || ''),
        phone: String(row?.phone || ''),
        website: String(row?.website || ''),
        address_street: String(row?.address_street || ''),
        address_city: String(row?.address_city || ''),
        address_province: String(row?.address_province || ''),
        address_postal_code: String(row?.address_postal_code || ''),
        address_country: String(row?.address_country || 'ZA'),
        description: String(row?.description || ''),
        seo_title: String(row?.seo_title || ''),
        seo_description: String(row?.seo_description || ''),
        seo_keywords: String(row?.seo_keywords || ''),
        google_analytics_id: String(row?.google_analytics_id || ''),
        facebook_pixel_id: String(row?.facebook_pixel_id || ''),
        legal_name: String(row?.legal_name || ''),
        registration_number: String(row?.registration_number || ''),
        tax_number: String(row?.tax_number || ''),
        business_hours: out,
      })
    }).catch(() => {})
  }, [companyId])

  useEffect(() => {
    ecommerceApi.integrationSettings.getMe().then((res: unknown) => {
      const data = (res as { data?: IntegrationSettings })?.data ?? res
      const row = data as IntegrationSettings
      if (row?.id) {
        setIntegrationSettings(row)
        setIntegrationForm({
          yoco_public_key: row.yoco_public_key ?? '',
          yoco_secret_key: row.yoco_secret_key ?? '',
          yoco_webhook_secret: row.yoco_webhook_secret ?? '',
          yoco_sandbox_mode: row.yoco_sandbox_mode ?? false,
          courier_guy_api_key: row.courier_guy_api_key ?? '',
          courier_guy_api_secret: row.courier_guy_api_secret ?? '',
          courier_guy_account_number: row.courier_guy_account_number ?? '',
          courier_guy_sandbox_mode: row.courier_guy_sandbox_mode ?? false,
        })
      }
    }).catch(() => {})
  }, [companyId])

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingCompany(true)
    try {
      const flagValue = customContactEmailEnabled ? 'true' : 'false'
      const existingFlag = siteSettings[CUSTOM_CONTACT_EMAIL_SETTING]
      if (existingFlag) {
        if (existingFlag.value !== flagValue) {
          await newsApi.siteSettings.update(existingFlag.id, {
            key: CUSTOM_CONTACT_EMAIL_SETTING,
            value: flagValue,
            type: existingFlag.type || 'boolean',
            description: '',
            is_public: false,
          })
        }
      } else {
        await newsApi.siteSettings.create({
          key: CUSTOM_CONTACT_EMAIL_SETTING,
          value: flagValue,
          type: 'boolean',
          description: '',
          is_public: false,
        })
      }

      const parsed: Record<string, unknown> = {}
      for (const [day, timeString] of Object.entries(companyForm.business_hours || {})) {
        if (!timeString || timeString.toLowerCase() === 'closed') parsed[day] = { closed: true }
        else if (timeString.includes(' - ')) {
          const [open, close] = timeString.split(' - ')
          parsed[day] = { open: open.trim(), close: close.trim() }
        } else parsed[day] = timeString
      }
      const companyPayload: Record<string, unknown> = {
        name: companyForm.name.trim(),
        phone: companyForm.phone || '',
        website: companyForm.website || '',
        address_street: companyForm.address_street || '',
        address_city: companyForm.address_city || '',
        address_province: companyForm.address_province || '',
        address_postal_code: companyForm.address_postal_code || '',
        address_country: companyForm.address_country || 'ZA',
        description: companyForm.description || '',
        seo_title: companyForm.seo_title || undefined,
        seo_description: companyForm.seo_description || undefined,
        seo_keywords: companyForm.seo_keywords || undefined,
        google_analytics_id: companyForm.google_analytics_id || undefined,
        facebook_pixel_id: companyForm.facebook_pixel_id || undefined,
        legal_name: companyForm.legal_name || '',
        registration_number: companyForm.registration_number || '',
        tax_number: companyForm.tax_number || '',
        business_hours: parsed,
      }
      if (customContactEmailEnabled) {
        companyPayload.email = companyForm.email || ''
      }
      await ecommerceApi.companies.update(companyId, companyPayload)
      setSiteSettingsValues((prev) => ({ ...prev, [CUSTOM_CONTACT_EMAIL_SETTING]: flagValue }))
      setSiteSettings((prev) => ({
        ...prev,
        [CUSTOM_CONTACT_EMAIL_SETTING]: {
          id: existingFlag?.id ?? prev[CUSTOM_CONTACT_EMAIL_SETTING]?.id ?? '',
          value: flagValue,
          type: 'boolean',
        },
      }))
      showSuccess('Business profile updated')
      router.refresh()
    } catch (error: unknown) {
      showError(getApiErrorMessage(error, 'Failed to update business profile'))
    } finally {
      setUpdatingCompany(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) {
      showError('Please select an image file')
      return
    }
    setUploadingLogo(true)
    try {
      const uploaded = (await newsApi.media.upload(file, { media_type: 'image' })) as { id?: string; file_url?: string }
      if (uploaded?.id) {
        await ecommerceApi.companies.update(companyId, { logo_id: uploaded.id })
        setCompanyForm((f) => ({ ...f, logo: uploaded.file_url || '' }))
        showSuccess('Logo updated')
        router.refresh()
      }
    } catch (error: unknown) {
      showError(getApiErrorMessage(error, 'Failed to upload logo'))
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

  const handleLogoRemove = async () => {
    if (!companyForm.logo) return
    if (!window.confirm('Remove the company logo? Header and footer will use the default image.')) return
    setRemovingLogo(true)
    try {
      await ecommerceApi.companies.update(companyId, { logo_id: null })
      setCompanyForm((f) => ({ ...f, logo: '' }))
      showSuccess('Logo removed')
      router.refresh()
    } catch (error: unknown) {
      showError(getApiErrorMessage(error, 'Failed to remove logo'))
    } finally {
      setRemovingLogo(false)
    }
  }

  const saveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingSiteSettings(true)
    try {
      const keys = [
        'site_tagline',
        'site_description',
        'social_facebook',
        'social_twitter',
        'social_instagram',
      ]
      for (const key of keys) {
        const val = siteSettingsValues[key] ?? ''
        const existing = siteSettings[key]
        if (existing) {
          if (existing.value !== val) {
            await newsApi.siteSettings.update(existing.id, { key, value: val, type: 'string', is_public: true })
          }
        } else if (val) {
          await newsApi.siteSettings.create({ key, value: val, type: 'string', is_public: true })
        }
      }
      const data = await newsApi.siteSettings.list()
      const arr = Array.isArray(data) ? data : ((data as { results?: unknown[] })?.results || [])
      const byKey: Record<string, { id: string; value: string; type: string }> = {}
      const vals: Record<string, string> = {}
      ;(arr as { key: string; id: string; value?: string; type?: string }[]).forEach((s) => {
        byKey[s.key] = { id: s.id, value: s.value ?? '', type: s.type || 'string' }
        vals[s.key] = s.value ?? ''
      })
      setSiteSettings(byKey)
      setSiteSettingsValues(vals)
      showSuccess('Site settings updated')
      router.refresh()
    } catch (err: unknown) {
      showError(getApiErrorMessage(err, 'Failed to update site settings'))
    } finally {
      setUpdatingSiteSettings(false)
    }
  }

  const handleUpdateIntegrationSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!integrationSettings?.id) return
    setUpdatingIntegration(true)
    try {
      const payload: Record<string, unknown> = { ...integrationForm }
      if (typeof payload.yoco_secret_key === 'string' && payload.yoco_secret_key.startsWith(MASK_PREFIX)) {
        delete payload.yoco_secret_key
      }
      if (typeof payload.yoco_webhook_secret === 'string' && payload.yoco_webhook_secret.startsWith(MASK_PREFIX)) {
        delete payload.yoco_webhook_secret
      }
      if (typeof payload.courier_guy_api_secret === 'string' && payload.courier_guy_api_secret.startsWith(MASK_PREFIX)) {
        delete payload.courier_guy_api_secret
      }
      await ecommerceApi.integrationSettings.update(integrationSettings.id, payload)
      showSuccess('Integration settings saved')
    } catch (error: unknown) {
      showError(getApiErrorMessage(error, 'Failed to save integration settings'))
    } finally {
      setUpdatingIntegration(false)
    }
  }

  if (activeTab === 'business') {
    return (
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold font-playfair flex items-center gap-2">
            <Building2 className="w-6 h-6 text-forest-primary" />
            Business Profile
          </h2>
          <Link href="/admin/branding" className="text-sm font-semibold text-forest-primary hover:underline">
            Branding &amp; page heroes →
          </Link>
        </div>
        <form onSubmit={handleUpdateCompany} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Company Name</label>
            <input
              type="text"
              value={companyForm.name}
              onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Company Logo</label>
            <div className="flex items-center gap-4 flex-wrap">
              {companyForm.logo ? (
                <img src={companyForm.logo} alt="Logo" className="w-16 h-16 rounded object-contain border border-border" />
              ) : (
                <div className="w-16 h-16 rounded bg-forest-primary/10 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-forest-primary/40" />
                </div>
              )}
              <label className="btn btn-secondary cursor-pointer inline-flex items-center gap-2">
                {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                <input type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} disabled={uploadingLogo} />
              </label>
              {companyForm.logo ? (
                <button type="button" onClick={handleLogoRemove} disabled={removingLogo} className="text-sm text-red-600 hover:underline">
                  {removingLogo ? 'Removing…' : 'Remove logo'}
                </button>
              ) : null}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Business email</label>
            {!customContactEmailEnabled ? (
              <>
                <input type="email" readOnly value={PLATFORM_CONTACT_EMAIL} className="form-input bg-gray-50" />
                <p className="text-xs text-text-muted">Temporary platform contact email shown on your storefront.</p>
              </>
            ) : (
              <input
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                className="form-input"
                required
              />
            )}
            <label className="flex items-center gap-2 mt-2 text-sm text-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={customContactEmailEnabled}
                onChange={(e) => setCustomContactEmailEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              Use my own contact email
            </label>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Phone</label>
            <input type="tel" value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} className="form-input" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Website</label>
            <input type="url" value={companyForm.website} onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })} className="form-input" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Address
            </label>
            <textarea value={companyForm.address_street} onChange={(e) => setCompanyForm({ ...companyForm, address_street: e.target.value })} className="form-input min-h-[60px] resize-none" />
            <div className="grid grid-cols-2 gap-2 mt-1">
              <input type="text" value={companyForm.address_city} onChange={(e) => setCompanyForm({ ...companyForm, address_city: e.target.value })} className="form-input" placeholder="City" />
              <input type="text" value={companyForm.address_province} onChange={(e) => setCompanyForm({ ...companyForm, address_province: e.target.value })} className="form-input" placeholder="Province" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <input type="text" value={companyForm.address_postal_code} onChange={(e) => setCompanyForm({ ...companyForm, address_postal_code: e.target.value })} className="form-input" placeholder="Postal code" />
              {countries.length > 0 ? (
                <select value={companyForm.address_country} onChange={(e) => setCompanyForm({ ...companyForm, address_country: e.target.value })} className="form-input">
                  {countries.map((c) => (
                    <option key={c.id} value={c.name === 'South Africa' ? 'ZA' : c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="text" value={companyForm.address_country} onChange={(e) => setCompanyForm({ ...companyForm, address_country: e.target.value })} className="form-input" placeholder="Country" />
              )}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Description</label>
            <textarea value={companyForm.description} onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })} className="form-input min-h-[60px] resize-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Business Hours
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-muted w-24 capitalize">{day}</span>
                  <input
                    type="text"
                    value={companyForm.business_hours?.[day] || ''}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        business_hours: { ...companyForm.business_hours, [day]: e.target.value },
                      })
                    }
                    className="form-input flex-1"
                    placeholder="9am - 5pm"
                  />
                </div>
              ))}
            </div>
          </div>
          <button type="submit" disabled={updatingCompany} className="btn btn-primary w-full flex items-center justify-center gap-2">
            {updatingCompany ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Business Profile
          </button>
        </form>
      </div>
    )
  }

  if (activeTab === 'site') {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold font-playfair mb-4 flex items-center gap-2">
          <Settings className="w-6 h-6 text-forest-primary" />
          Site Settings
        </h2>
        <p className="text-xs text-text-muted mb-4">Tagline and description appear in the header and home hero fallback. Contact syncs from business profile.</p>
        <form onSubmit={saveSiteSettings} className="space-y-4">
          {[
            { key: 'site_tagline', label: 'Site tagline' },
            { key: 'site_description', label: 'Site description' },
            { key: 'social_facebook', label: 'Facebook URL' },
            { key: 'social_twitter', label: 'Twitter/X URL' },
            { key: 'social_instagram', label: 'Instagram URL' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</label>
              <input
                type={key.startsWith('social_') ? 'url' : 'text'}
                value={siteSettingsValues[key] ?? ''}
                onChange={(e) => setSiteSettingsValues((v) => ({ ...v, [key]: e.target.value }))}
                className="form-input"
              />
            </div>
          ))}
          <button type="submit" disabled={updatingSiteSettings} className="btn btn-secondary w-full flex items-center justify-center gap-2">
            {updatingSiteSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Site Settings
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold font-playfair mb-4 flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-forest-primary" />
        Integrations
      </h2>
      <p className="text-xs text-text-muted mb-4">Configure Yoco payments and Courier Guy shipping.</p>
      <form onSubmit={handleUpdateIntegrationSettings} className="space-y-6">
        <div className="space-y-4 border-b border-border pb-6">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Yoco
          </h3>
          <input type="text" placeholder="Public key" value={String(integrationForm.yoco_public_key ?? '')} onChange={(e) => setIntegrationForm({ ...integrationForm, yoco_public_key: e.target.value })} className="form-input" />
          <div className="flex gap-2">
            <input
              type={secretVisible.yoco_secret_key ? 'text' : 'password'}
              placeholder="Secret key"
              value={String(integrationForm.yoco_secret_key ?? '')}
              onChange={(e) => setIntegrationForm({ ...integrationForm, yoco_secret_key: e.target.value })}
              className="form-input flex-1"
            />
            <button type="button" className="btn btn-secondary text-sm" onClick={() => setSecretVisible((v) => ({ ...v, yoco_secret_key: !v.yoco_secret_key }))}>
              {secretVisible.yoco_secret_key ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!integrationForm.yoco_sandbox_mode} onChange={(e) => setIntegrationForm({ ...integrationForm, yoco_sandbox_mode: e.target.checked })} />
            Sandbox mode
          </label>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Courier Guy
          </h3>
          <input type="text" placeholder="API key" value={String(integrationForm.courier_guy_api_key ?? '')} onChange={(e) => setIntegrationForm({ ...integrationForm, courier_guy_api_key: e.target.value })} className="form-input" />
          <div className="flex gap-2">
            <input
              type={secretVisible.courier_guy_api_secret ? 'text' : 'password'}
              placeholder="API secret"
              value={String(integrationForm.courier_guy_api_secret ?? '')}
              onChange={(e) => setIntegrationForm({ ...integrationForm, courier_guy_api_secret: e.target.value })}
              className="form-input flex-1"
            />
            <button type="button" className="btn btn-secondary text-sm" onClick={() => setSecretVisible((v) => ({ ...v, courier_guy_api_secret: !v.courier_guy_api_secret }))}>
              {secretVisible.courier_guy_api_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <input type="text" placeholder="Account number" value={String(integrationForm.courier_guy_account_number ?? '')} onChange={(e) => setIntegrationForm({ ...integrationForm, courier_guy_account_number: e.target.value })} className="form-input" />
        </div>
        <button type="submit" disabled={updatingIntegration || !integrationSettings?.id} className="btn btn-secondary w-full flex items-center justify-center gap-2">
          {updatingIntegration ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Integration Settings
        </button>
      </form>
    </div>
  )
}
