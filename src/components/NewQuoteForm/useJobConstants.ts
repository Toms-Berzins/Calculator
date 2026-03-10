import { useMemo, useState } from 'react'
import { formatCurrency } from '@/lib/utils/format'
import {
  CONSTANT_DEFINITIONS,
  type ConstantChip,
  type JobConstantKey,
  type NewQuoteFormProps,
} from './NewQuoteForm.types'

interface UseJobConstantsResult {
  jobConstants: Record<JobConstantKey, number>
  constantChips: ConstantChip[]
  canUndoRemove: boolean
  editingConstant: ConstantChip | null
  editingConstantValue: string
  editConstantError: string
  setEditingConstantValue: (value: string) => void
  openConstantEditor: (key: JobConstantKey) => void
  closeConstantEditor: () => void
  saveConstant: () => void
  removeConstant: (key: JobConstantKey) => void
  undoRemoveConstant: () => void
}

export function useJobConstants(
  calculatorDefaults: NewQuoteFormProps['calculatorDefaults'],
): UseJobConstantsResult {
  const [jobConstants, setJobConstants] = useState<Record<JobConstantKey, number>>({
    material_price_per_kg: calculatorDefaults.material_price_per_kg,
    machine_rate_per_hour: calculatorDefaults.machine_rate_per_hour,
    labor_rate_per_hour: calculatorDefaults.labor_rate_per_hour,
    power_consumption_kw: calculatorDefaults.power_consumption_kw,
    electricity_rate_per_kwh: calculatorDefaults.electricity_rate_per_kwh,
    failure_rate_percent: calculatorDefaults.failure_rate_percent,
    margin_percent: calculatorDefaults.margin_percent,
    difficulty_multiplier_percent: 100,
  })
  const [editingConstantKey, setEditingConstantKey] = useState<JobConstantKey | null>(null)
  const [editingConstantValue, setEditingConstantValue] = useState('')
  const [editConstantError, setEditConstantError] = useState('')
  const [removedConstantKeys, setRemovedConstantKeys] = useState<JobConstantKey[]>([])

  const constantChips = useMemo(
    () =>
      CONSTANT_DEFINITIONS.map((definition) => {
        const rawValue = jobConstants[definition.key]
        const value =
          definition.key === 'power_consumption_kw'
            ? `${rawValue.toFixed(2)} kW`
            : definition.key === 'failure_rate_percent' ||
                definition.key === 'margin_percent' ||
                definition.key === 'difficulty_multiplier_percent'
              ? `${rawValue}%`
              : formatCurrency(rawValue)

        return {
          key: definition.key,
          label: definition.label,
          value,
          step: definition.step,
          rawValue,
        }
      }),
    [jobConstants],
  )

  const editingConstant = useMemo(
    () =>
      editingConstantKey
        ? constantChips.find((chip) => chip.key === editingConstantKey) ?? null
        : null,
    [constantChips, editingConstantKey],
  )

  function openConstantEditor(key: JobConstantKey) {
    setEditingConstantKey(key)
    setEditingConstantValue(String(jobConstants[key]))
    setEditConstantError('')
  }

  function closeConstantEditor() {
    setEditingConstantKey(null)
    setEditingConstantValue('')
    setEditConstantError('')
  }

  function saveConstant() {
    if (!editingConstantKey) return

    const parsedValue = Number(editingConstantValue)
    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      setEditConstantError('Please enter a valid number greater than or equal to 0.')
      return
    }

    setJobConstants((prev) => ({
      ...prev,
      [editingConstantKey]: parsedValue,
    }))
    closeConstantEditor()
  }

  function removeConstant(key: JobConstantKey) {
    setRemovedConstantKeys((prev) => (prev.includes(key) ? prev : [...prev, key]))
    if (editingConstantKey === key) {
      closeConstantEditor()
    }
  }

  function undoRemoveConstant() {
    setRemovedConstantKeys((prev) => prev.slice(0, -1))
  }

  return {
    jobConstants,
    constantChips: constantChips.filter((chip) => !removedConstantKeys.includes(chip.key)),
    canUndoRemove: removedConstantKeys.length > 0,
    editingConstant,
    editingConstantValue,
    editConstantError,
    setEditingConstantValue,
    openConstantEditor,
    closeConstantEditor,
    saveConstant,
    removeConstant,
    undoRemoveConstant,
  }
}
