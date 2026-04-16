'use client'

import { useState, useTransition } from 'react'
import { createMaterial, updateMaterial, toggleMaterialActive } from '@/lib/actions/materials'
import type { Material, MaterialType } from '@/types/database'
import type { Translations } from '@/i18n/en'
import styles from './materials.module.css'

const LOW_STOCK_THRESHOLD = 200

const MATERIAL_TYPES: MaterialType[] = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon', 'Other']

type MaterialsDict = Translations['materials']

interface Props {
  materials: Material[]
  dict: MaterialsDict
}

interface Feedback {
  type: 'success' | 'error'
  message: string
}

// ── Create form ──────────────────────────────────────────────────────────────

function CreateForm({ dict, onFeedback }: { dict: MaterialsDict; onFeedback: (f: Feedback) => void }) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const form = e.currentTarget
    startTransition(async () => {
      try {
        await createMaterial(formData)
        form.reset()
        onFeedback({ type: 'success', message: dict.feedback.createSuccess })
      } catch {
        onFeedback({ type: 'error', message: dict.feedback.error })
      }
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label htmlFor="create-name" className={styles.fieldLabel}>{dict.fields.name} *</label>
          <input
            id="create-name"
            name="name"
            type="text"
            required
            placeholder={dict.create.namePlaceholder}
            className={`input-field ${styles.formInput}`}
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor="create-type" className={styles.fieldLabel}>{dict.fields.type} *</label>
          <select id="create-type" name="material_type" required className={`input-field ${styles.formInput}`}>
            {MATERIAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {dict.types[t]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formField}>
          <label htmlFor="create-brand" className={styles.fieldLabel}>{dict.fields.brand}</label>
          <input
            id="create-brand"
            name="brand"
            type="text"
            placeholder={dict.fields.brandPlaceholder}
            className={`input-field ${styles.formInput}`}
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor="create-color" className={styles.fieldLabel}>{dict.fields.color}</label>
          <input
            id="create-color"
            name="color"
            type="text"
            placeholder={dict.fields.colorPlaceholder}
            className={`input-field ${styles.formInput}`}
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor="create-price" className={styles.fieldLabel}>{dict.fields.pricePerKg}</label>
          <input
            id="create-price"
            name="price_per_kg"
            type="number"
            min="0"
            step="0.01"
            defaultValue="0"
            className={`input-field ${styles.formInput}`}
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor="create-stock" className={styles.fieldLabel}>{dict.fields.stockGrams}</label>
          <input
            id="create-stock"
            name="stock_grams"
            type="number"
            min="0"
            step="1"
            defaultValue="0"
            className={`input-field ${styles.formInput}`}
          />
        </div>
      </div>
      <div className={styles.actionRow}>
        <button type="submit" disabled={isPending} className={`btn-primary ${styles.submitBtn}`}>
          {isPending ? '…' : dict.create.submitBtn}
        </button>
      </div>
    </form>
  )
}

// ── Edit form ────────────────────────────────────────────────────────────────

function EditForm({
  material,
  dict,
  onFeedback,
  onClose,
}: {
  material: Material
  dict: MaterialsDict
  onFeedback: (f: Feedback) => void
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateMaterial(formData)
        onFeedback({ type: 'success', message: dict.feedback.updateSuccess })
        onClose()
      } catch {
        onFeedback({ type: 'error', message: dict.feedback.error })
      }
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={material.id} />
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label htmlFor={`edit-name-${material.id}`} className={styles.fieldLabel}>{dict.fields.name} *</label>
          <input
            id={`edit-name-${material.id}`}
            name="name"
            type="text"
            required
            defaultValue={material.name}
            className={`input-field ${styles.formInput}`}
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor={`edit-type-${material.id}`} className={styles.fieldLabel}>{dict.fields.type} *</label>
          <select
            id={`edit-type-${material.id}`}
            name="material_type"
            required
            defaultValue={material.material_type}
            className={`input-field ${styles.formInput}`}
          >
            {MATERIAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {dict.types[t]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formField}>
          <label htmlFor={`edit-brand-${material.id}`} className={styles.fieldLabel}>{dict.fields.brand}</label>
          <input
            id={`edit-brand-${material.id}`}
            name="brand"
            type="text"
            defaultValue={material.brand ?? ''}
            placeholder={dict.fields.brandPlaceholder}
            className={`input-field ${styles.formInput}`}
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor={`edit-color-${material.id}`} className={styles.fieldLabel}>{dict.fields.color}</label>
          <input
            id={`edit-color-${material.id}`}
            name="color"
            type="text"
            defaultValue={material.color ?? ''}
            placeholder={dict.fields.colorPlaceholder}
            className={`input-field ${styles.formInput}`}
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor={`edit-price-${material.id}`} className={styles.fieldLabel}>{dict.fields.pricePerKg}</label>
          <input
            id={`edit-price-${material.id}`}
            name="price_per_kg"
            type="number"
            min="0"
            step="0.01"
            defaultValue={material.price_per_kg}
            className={`input-field ${styles.formInput}`}
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor={`edit-stock-${material.id}`} className={styles.fieldLabel}>{dict.fields.stockGrams}</label>
          <input
            id={`edit-stock-${material.id}`}
            name="stock_grams"
            type="number"
            min="0"
            step="1"
            defaultValue={material.stock_grams}
            className={`input-field ${styles.formInput}`}
          />
        </div>
      </div>
      <div className={styles.actionRow}>
        <button type="submit" disabled={isPending} className={`btn-primary ${styles.submitBtn}`}>
          {isPending ? '…' : dict.actions.save}
        </button>
        <button type="button" onClick={onClose} className={`btn-secondary ${styles.cancelBtn}`}>
          {dict.actions.cancel}
        </button>
      </div>
    </form>
  )
}

// ── Toggle active button ─────────────────────────────────────────────────────

function ToggleActiveButton({
  material,
  dict,
  onFeedback,
}: {
  material: Material
  dict: MaterialsDict
  onFeedback: (f: Feedback) => void
}) {
  const [isPending, startTransition] = useTransition()

  function handleToggle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await toggleMaterialActive(formData)
        onFeedback({ type: 'success', message: dict.feedback.toggleSuccess })
      } catch {
        onFeedback({ type: 'error', message: dict.feedback.error })
      }
    })
  }

  return (
    <form onSubmit={handleToggle}>
      <input type="hidden" name="id" value={material.id} />
      <input type="hidden" name="is_active" value={String(material.is_active)} />
      <button
        type="submit"
        disabled={isPending}
        className={`${styles.toggleBtn} ${material.is_active ? styles.toggleBtnArchive : styles.toggleBtnActivate}`}
      >
        {material.is_active ? dict.actions.archive : dict.actions.activate}
      </button>
    </form>
  )
}

// ── Material row ─────────────────────────────────────────────────────────────

function MaterialRow({
  material,
  dict,
  isEditing,
  onEdit,
  onCloseEdit,
  onFeedback,
}: {
  material: Material
  dict: MaterialsDict
  isEditing: boolean
  onEdit: () => void
  onCloseEdit: () => void
  onFeedback: (f: Feedback) => void
}) {
  const isLowStock = material.stock_grams < LOW_STOCK_THRESHOLD

  return (
    <div
      className={`${styles.row} ${!material.is_active ? styles.rowInactive : ''} ${isLowStock && material.is_active ? styles.rowLowStock : ''}`}
    >
      <div className={styles.rowMain}>
        <div className={styles.rowInfo}>
          <div className={styles.rowNameLine}>
            <span className={styles.rowName}>{material.name}</span>
            <span className={styles.typeBadge}>{dict.types[material.material_type]}</span>
            {!material.is_active && (
              <span className={styles.inactiveBadge}>{dict.inactiveLabel}</span>
            )}
          </div>
          {(material.brand || material.color) && (
            <span className={styles.rowMeta}>
              {[material.brand, material.color].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>

        <div className={styles.rowStats}>
          <div className={styles.rowStat}>
            <span className={styles.rowStatLabel}>{dict.fields.stockGrams}</span>
            <span className={`${styles.rowStatValue} ${isLowStock && material.is_active ? styles.lowStockValue : ''}`}>
              {material.stock_grams}g
              {isLowStock && material.is_active && (
                <span className={styles.lowStockBadge}>{dict.lowStockBadge}</span>
              )}
            </span>
          </div>
          <div className={styles.rowStat}>
            <span className={styles.rowStatLabel}>{dict.fields.pricePerKg}</span>
            <span className={styles.rowStatValue}>€{Number(material.price_per_kg).toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.rowActions}>
          <ToggleActiveButton material={material} dict={dict} onFeedback={onFeedback} />
          <button
            type="button"
            onClick={isEditing ? onCloseEdit : onEdit}
            className={`${styles.editBtn} ${isEditing ? styles.editBtnActive : ''}`}
          >
            {isEditing ? dict.actions.cancel : dict.actions.edit}
          </button>
        </div>
      </div>

      {isEditing && (
        <div className={styles.editPanel}>
          <EditForm
            material={material}
            dict={dict}
            onFeedback={onFeedback}
            onClose={onCloseEdit}
          />
        </div>
      )}
    </div>
  )
}

// ── Main container ───────────────────────────────────────────────────────────

export default function MaterialsContainer({ materials, dict }: Props) {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const totalCount = materials.length
  const activeCount = materials.filter((m) => m.is_active).length
  const lowStockCount = materials.filter((m) => m.is_active && m.stock_grams < LOW_STOCK_THRESHOLD).length
  const totalStockKg = Math.round(materials.reduce((sum, m) => sum + m.stock_grams, 0)) / 1000

  function handleFeedback(f: Feedback) {
    setFeedback(f)
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <div className={styles.shell}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{dict.title}</h1>
          <p className={styles.pageSubtitle}>{dict.pageDescription}</p>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`${styles.feedbackBanner} ${feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}`}
        >
          {feedback.message}
        </div>
      )}

      {/* Stats strip */}
      <div className={styles.statsStrip} role="group" aria-label={dict.title}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalCount}</span>
          <span className={styles.statLabel}>{dict.stats.total}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{activeCount}</span>
          <span className={styles.statLabel}>{dict.stats.active}</span>
        </div>
        <div className={`${styles.statCard} ${lowStockCount > 0 ? styles.statCardWarning : ''}`}>
          <span className={styles.statValue}>{lowStockCount}</span>
          <span className={styles.statLabel}>{dict.stats.lowStock}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {totalStockKg.toFixed(2)}
            <span className={styles.statUnit}>{dict.stats.weightUnit}</span>
          </span>
          <span className={styles.statLabel}>{dict.stats.totalWeight}</span>
        </div>
      </div>

      {/* Create form */}
      <details className={styles.createDetails}>
        <summary className={styles.createSummary}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="7" y1="1" x2="7" y2="13" />
            <line x1="1" y1="7" x2="13" y2="7" />
          </svg>
          {dict.create.summaryLabel}
        </summary>
        <div className={styles.createCard}>
          <CreateForm dict={dict} onFeedback={handleFeedback} />
        </div>
      </details>

      {/* Materials list */}
      {materials.length === 0 ? (
        <div className={styles.emptyCard}>
          <p className={styles.emptyText}>{dict.emptyState}</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          {materials.map((material) => (
            <MaterialRow
              key={material.id}
              material={material}
              dict={dict}
              isEditing={editingId === material.id}
              onEdit={() => setEditingId(material.id)}
              onCloseEdit={() => setEditingId(null)}
              onFeedback={handleFeedback}
            />
          ))}
        </div>
      )}
    </div>
  )
}
