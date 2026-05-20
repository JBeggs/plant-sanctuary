'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, ImageIcon, Loader2, Upload, Trash2 } from 'lucide-react'
import { newsApi } from '@/lib/api'
import { ensureAbsoluteImageUrl } from '@/lib/image-utils'
import type { HeroablePage } from '@/lib/hero-pages'
import type { PageHero } from '@/lib/page-hero'

type Props = {
  page: HeroablePage
  hero: PageHero | null
  onSaved: () => void | Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

type MediaUploadResponse = { id: string; file_url?: string }

export default function PageHeroEditor({
  page,
  hero,
  onSaved,
  onError,
  onSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState(hero?.title ?? '')
  const [subtitle, setSubtitle] = useState(hero?.subtitle ?? '')
  const [enabled, setEnabled] = useState(hero?.enabled ?? true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const currentImageUrl = previewUrl ?? (hero?.imageUrl ? ensureAbsoluteImageUrl(hero.imageUrl) : null)
  const hasExisting = Boolean(hero?.id)
  const mustUploadBeforeEnable = enabled && !currentImageUrl && !file
  const isLive = Boolean(hero?.enabled && hero?.imageUrl)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null
    setFile(picked)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (picked) {
      setPreviewUrl(URL.createObjectURL(picked))
      setEnabled(true)
    } else {
      setPreviewUrl(null)
    }
  }

  const resetFile = () => {
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async () => {
    if (saving) return
    if (mustUploadBeforeEnable) {
      onError('Upload an image before enabling the hero.')
      return
    }
    setSaving(true)
    try {
      let imageId: string | undefined
      if (file) {
        const uploaded = (await newsApi.media.upload(file, {
          media_type: 'image',
          alt_text: title || page.label,
          is_public: true,
        })) as MediaUploadResponse
        if (!uploaded?.id) {
          throw new Error('Upload response missing media id')
        }
        imageId = uploaded.id
      }

      const payload: Record<string, unknown> = { title, subtitle, enabled }
      if (imageId) payload.image_id = imageId

      if (hasExisting && hero) {
        await newsApi.pageHeroes.update(hero.id, payload)
      } else {
        await newsApi.pageHeroes.create({
          page_slug: page.slug,
          image_id: imageId ?? null,
          title,
          subtitle,
          enabled,
        })
      }

      resetFile()
      onSuccess(`Saved ${page.label} hero.`)
      await onSaved()
    } catch (err) {
      console.error('[PageHeroEditor] save failed:', err)
      onError(
        err instanceof Error
          ? `Failed to save ${page.label} hero: ${err.message}`
          : `Failed to save ${page.label} hero.`,
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!hero?.id || deleting) return
    if (!window.confirm(`Remove the uploaded hero for ${page.label}?`)) return
    setDeleting(true)
    try {
      await newsApi.pageHeroes.delete(hero.id)
      onSuccess(`Removed ${page.label} hero.`)
      await onSaved()
    } catch (err) {
      console.error('[PageHeroEditor] delete failed:', err)
      onError(`Failed to remove ${page.label} hero.`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="bg-surface border border-border rounded-xl p-6 shadow-sm">
      <header className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold font-playfair text-text">{page.label}</h2>
            <Link
              href={page.path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-forest-primary transition-colors"
              title={`Open ${page.path}`}
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
            <span
              className={
                'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ' +
                (isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')
              }
            >
              {isLive ? 'LIVE' : 'HIDDEN'}
            </span>
          </div>
          {page.description && <p className="text-sm text-text-muted mt-1">{page.description}</p>}
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer select-none flex-shrink-0">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm font-bold uppercase tracking-wider text-text">
            Show on {page.label}
          </span>
        </label>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        <div className="aspect-[4/3] bg-surface-raised rounded-lg overflow-hidden border border-dashed border-border flex items-center justify-center">
          {currentImageUrl ? (
            <img src={currentImageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <ImageIcon className="w-10 h-10" />
              <span className="text-xs uppercase tracking-wider">No image</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
              Hero image
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <label className="btn btn-secondary text-sm inline-flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                {file ? 'Replace file' : currentImageUrl ? 'Replace image' : 'Upload image'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {file && (
                <button type="button" onClick={resetFile} className="text-xs text-text-muted underline">
                  Cancel selection
                </button>
              )}
              {hasExisting && !file && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Remove hero
                </button>
              )}
            </div>
            {file && <p className="text-xs text-text-muted mt-1 truncate">Selected: {file.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
              Title <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g. Welcome to ${page.label}`}
              className="form-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
              Subtitle <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              maxLength={500}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Short tagline"
              className="form-input text-sm"
            />
          </div>

          {mustUploadBeforeEnable && (
            <p className="text-xs text-forest-accent font-medium">Upload an image before enabling the hero.</p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || mustUploadBeforeEnable}
              className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Save hero
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
