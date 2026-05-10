'use client'

import { useState, useRef } from 'react'
import { uploadFile, imageUrl, rawUrl, is3DFile } from '@/lib/cloudinary'
import { upsertProductMedia } from '@/lib/actions/productMedia'
import type { ProductMedia } from '@/lib/actions/productMedia'
import { useT } from '@/i18n/context'
import styles from './products.module.css'

// ── Static product catalogue (mirrors the store's products.js) ────────────────

const PRODUCTS = [
  { id: 1,  slug: 'dragon-mech',           name: 'Dragon Mech',           cat: 'Figures',   mat: 'Resin'   },
  { id: 2,  slug: 'crystal-golem',         name: 'Crystal Golem',         cat: 'Figures',   mat: 'Resin'   },
  { id: 3,  slug: 'hex-maze-cube',         name: 'Hex Maze Cube',         cat: 'Puzzles',   mat: 'PLA'     },
  { id: 4,  slug: 'orbital-ring',          name: 'Orbital Ring',          cat: 'Decor',     mat: 'PLA'     },
  { id: 5,  slug: 'mech-raptor',           name: 'Mech Raptor',           cat: 'Figures',   mat: 'PETG'    },
  { id: 6,  slug: 'labyrinth-vase',        name: 'Labyrinth Vase',        cat: 'Decor',     mat: 'PLA'     },
  { id: 7,  slug: 'nano-chess-set',        name: 'Nano Chess Set',        cat: 'Puzzles',   mat: 'Resin'   },
  { id: 8,  slug: 'phoenix-wing',          name: 'Phoenix Wing',          cat: 'Figures',   mat: 'PETG'    },
  { id: 9,  slug: 'bolt-fidget',           name: 'Bolt Fidget',           cat: 'Gadgets',   mat: 'PLA'     },
  { id: 10, slug: 'geodesic-lamp',         name: 'Geodesic Lamp',         cat: 'Decor',     mat: 'PLA'     },
  { id: 11, slug: 'samurai-helmet',        name: 'Samurai Helmet',        cat: 'Wearables', mat: 'PETG'    },
  { id: 12, slug: 'circuit-ring',          name: 'Circuit Ring',          cat: 'Wearables', mat: 'Resin'   },
  { id: 13, slug: 'cylinder-candle-mold',  name: 'Cylinder Candle Mold',  cat: 'Molds',     mat: 'Silicon' },
  { id: 14, slug: 'hex-concrete-mold',     name: 'Hex Concrete Mold',     cat: 'Molds',     mat: 'Silicon' },
  { id: 15, slug: 'taper-vase-mold',       name: 'Taper Vase Mold',       cat: 'Molds',     mat: 'Silicon' },
  { id: 16, slug: 'heart-soap-mold',       name: 'Heart Soap Mold',       cat: 'Molds',     mat: 'Silicon' },
]

// ── Types ─────────────────────────────────────────────────────────────────────

interface UploadState {
  kind: 'image' | 'model'
  pct: number
}

interface Feedback {
  type: 'success' | 'error'
  message: string
}

// ── Upload zone ───────────────────────────────────────────────────────────────

function UploadZone({
  label,
  accept,
  disabled,
  onFile,
}: {
  label: string
  accept: string
  disabled: boolean
  onFile: (f: File) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) { onFile(file); e.target.value = '' }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files?.[0]
    if (file && !disabled) onFile(file)
  }

  return (
    <div
      className={`${styles.zone}${drag ? ` ${styles.zoneDrag}` : ''}${disabled ? ` ${styles.zoneDis}` : ''}`}
      onClick={() => !disabled && ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={disabled ? undefined : onDrop}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && !disabled && ref.current?.click()}
      aria-label={label}
      aria-disabled={disabled}
    >
      <span>{label}</span>
      <input ref={ref} type="file" accept={accept} onChange={pick} className={styles.zoneInput} />
    </div>
  )
}

// ── Product row ───────────────────────────────────────────────────────────────

function ProductRow({
  product,
  media,
  onFeedback,
}: {
  product: typeof PRODUCTS[number]
  media: ProductMedia | undefined
  onFeedback: (f: Feedback) => void
}) {
  const t = useT()
  const p = t.products

  const [localMedia, setLocalMedia] = useState<ProductMedia>(
    media ?? { slug: product.slug, image_ids: [], model_id: null },
  )
  const [uploading, setUploading] = useState<UploadState | null>(null)

  async function handleFile(file: File) {
    const kind = is3DFile(file) ? 'model' : 'image'
    setUploading({ kind, pct: 0 })

    try {
      const result = await uploadFile(file, (pct) => setUploading({ kind, pct }))

      const next: ProductMedia = { ...localMedia }
      if (kind === 'image') {
        next.image_ids = [...localMedia.image_ids.filter((id) => id !== result.public_id), result.public_id]
      } else {
        next.model_id = result.public_id
      }

      await upsertProductMedia(next.slug, next.image_ids, next.model_id)
      setLocalMedia(next)
      onFeedback({ type: 'success', message: p.saved })
    } catch (err) {
      onFeedback({ type: 'error', message: `${p.errorPrefix} ${(err as Error).message}` })
    } finally {
      setUploading(null)
    }
  }

  async function removeImage(publicId: string) {
    const next: ProductMedia = {
      ...localMedia,
      image_ids: localMedia.image_ids.filter((id) => id !== publicId),
    }
    await upsertProductMedia(next.slug, next.image_ids, next.model_id)
    setLocalMedia(next)
  }

  async function removeModel() {
    const next: ProductMedia = { ...localMedia, model_id: null }
    await upsertProductMedia(next.slug, next.image_ids, next.model_id)
    setLocalMedia(next)
  }

  return (
    <div className={styles.row}>
      {/* Product info */}
      <div className={styles.rowInfo}>
        <span className={styles.rowName}>{product.name}</span>
        <div className={styles.rowMeta}>
          <span className={styles.badge}>{product.cat}</span>
          <span className={styles.badge}>{product.mat}</span>
        </div>
      </div>

      {/* Photos column */}
      <div className={styles.rowCol}>
        <div className={styles.thumbRow}>
          {localMedia.image_ids.map((id) => (
            <div className={styles.thumb} key={id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl(id, { width: 120 })} alt="" className={styles.thumbImg} />
              <button
                className={styles.thumbDel}
                title={p.removePhoto}
                onClick={() => removeImage(id)}
                type="button"
              >
                ×
              </button>
            </div>
          ))}
          <UploadZone
            label={p.addPhoto}
            accept="image/*"
            disabled={!!uploading}
            onFile={handleFile}
          />
        </div>
      </div>

      {/* 3D model column */}
      <div className={styles.rowCol}>
        {localMedia.model_id ? (
          <div className={styles.modelRow}>
            <span className={styles.modelName}>{localMedia.model_id.split('/').pop()}</span>
            <a
              className={styles.modelLink}
              href={rawUrl(localMedia.model_id)}
              target="_blank"
              rel="noreferrer"
              title={p.downloading}
            >
              ↗
            </a>
            <button
              className={styles.thumbDel}
              title={p.removeModel}
              onClick={removeModel}
              type="button"
            >
              ×
            </button>
          </div>
        ) : (
          <UploadZone
            label={p.addModel}
            accept=".glb,.gltf,.obj,.stl,.fbx,.3ds"
            disabled={!!uploading}
            onFile={handleFile}
          />
        )}
      </div>

      {/* Progress / status */}
      {uploading && (
        <div className={styles.progressWrap}>
          <div className={styles.progressBar} style={{ width: `${uploading.pct}%` }} />
          <span className={styles.progressLabel}>
            {p.uploading(uploading.kind, uploading.pct)}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Main container ────────────────────────────────────────────────────────────

export default function ProductsContainer({ mediaList }: { mediaList: ProductMedia[] }) {
  const t = useT()
  const p = t.products

  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const mediaBySlug = Object.fromEntries(mediaList.map((m) => [m.slug, m]))
  const withPhoto = mediaList.filter((m) => m.image_ids.length > 0).length
  const withModel = mediaList.filter((m) => m.model_id).length

  function handleFeedback(f: Feedback) {
    setFeedback(f)
    setTimeout(() => setFeedback(null), 3000)
  }

  return (
    <div className={styles.shell}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{p.title}</h1>
          <p className={styles.pageSubtitle}>{p.pageDescription}</p>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`${styles.feedbackBanner} ${feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}`}
        >
          {feedback.message}
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsStrip}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{PRODUCTS.length}</span>
          <span className={styles.statLabel}>{p.stats.total}</span>
        </div>
        <div className={`${styles.statCard} ${styles.statPhoto}`}>
          <span className={styles.statValue}>{withPhoto}</span>
          <span className={styles.statLabel}>{p.stats.withPhoto}</span>
        </div>
        <div className={`${styles.statCard} ${styles.statModel}`}>
          <span className={styles.statValue}>{withModel}</span>
          <span className={styles.statLabel}>{p.stats.withModel}</span>
        </div>
      </div>

      {/* Column headers */}
      <div className={styles.colHeaders}>
        <div className={styles.colHeaderProduct}>Product</div>
        <div className={styles.colHeaderMedia}>{p.colPhoto}</div>
        <div className={styles.colHeaderMedia}>{p.colModel}</div>
      </div>

      {/* Product list */}
      <div className={styles.tableWrap}>
        {PRODUCTS.map((prod) => (
          <ProductRow
            key={prod.slug}
            product={prod}
            media={mediaBySlug[prod.slug]}
            onFeedback={handleFeedback}
          />
        ))}
      </div>
    </div>
  )
}
