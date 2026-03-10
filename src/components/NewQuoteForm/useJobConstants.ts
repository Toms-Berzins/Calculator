import { useMemo, useState } from 'react'
import { formatCurrency } from '@/lib/utils/format'
import { useT } from '@/i18n/context'
import {
  CONSTANT_DEFINITIONS,
  DIFFICULTY_LEVELS,
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
  difficultyLabel: string
  setEditingConstantValue: (value: string) => void
  openConstantEditor: (key: JobConstantKey) => void
  cycleConstant: (key: JobConstantKey) => void
  closeConstantEditor: () => void
  saveConstant: () => void
  removeConstant: (key: JobConstantKey) => void
  undoRemoveConstant: () => void
}

export function useJobConstants(
  calculatorDefaults: NewQuoteFormProps['calculatorDefaults'],
): UseJobConstantsResult {
  const t = useT()
  const [jobConstants, setJobConstants] = useState<Record<JobConstantKey, number>>({
    material_price_per_kg: calculatorDefaults.material_price_per_kg,
    machine_rate_per_hour: calculatorDefaults.machine_rate_per_hour,
    labor_rate_per_hour: calculatorDefaults.labor_rate_per_hour,
    power_consumption_kw: calculatorDefaults.power_consumption_kw,
    electricity_rate_per_kwh: calculatorDefaults.electricity_rate_per_kwh,
    failure_rate_percent: calculatorDefaults.failure_rate_percent,
    margin_percent: calculatorDefaults.margin_percent,
    material_overhead_percent: calculatorDefaults.material_overhead_percent,
    difficulty_multiplier_percent: 100,
  })
  const [editingConstantKey, setEditingConstantKey] = useState<JobConstantKey | null>(null)
  const [editingConstantValue, setEditingConstantValue] = useState('')
  const [editConstantError, setEditConstantError] = useState('')
  const [removedConstants, setRemovedConstants] = useState<{ key: JobConstantKey; previousValue: number }[]>([])

  const removedConstantKeys = removedConstants.map((r) => r.key)

  /** The value a constant gets when removed — neutral/zero so it doesn't affect pricing */
  function neutralValue(key: JobConstantKey): number {
    return key === 'difficulty_multiplier_percent' ? 100 : 0
  }

  const constantChips = useMemo(
    () =>
      CONSTANT_DEFINITIONS.map((definition) => {
        const rawValue = jobConstants[definition.key]
        const value =
          definition.key === 'power_consumption_kw'
            ? `${rawValue.toFixed(2)} kW`
            : definition.key === 'failure_rate_percent' ||
                definition.key === 'margin_percent' ||
                definition.key === 'material_overhead_percent' ||
                definition.key === 'difficulty_multiplier_percent'
              ? `${rawValue}%`
              : formatCurrency(rawValue)

        let displayValue = value
        if (definition.key === 'difficulty_multiplier_percent') {
          const level =
            DIFFICULTY_LEVELS.find((l) => l.value === rawValue) ?? DIFFICULTY_LEVELS[0]
          displayValue = `${t.newQuote.difficultyLevels[level.labelKey]} ${level.multiplier}`
        }

        return {
          key: definition.key,
          label: t.newQuote.constantLabels[definition.key],
          value: displayValue,
          step: definition.step,
          rawValue,
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobConstants, t],
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

  function cycleConstant(key: JobConstantKey) {
    if (key !== 'difficulty_multiplier_percent') return
    const current = jobConstants[key]
    const idx = DIFFICULTY_LEVELS.findIndex((l) => l.value === current)
    const next = DIFFICULTY_LEVELS[(idx + 1) % DIFFICULTY_LEVELS.length]
    setJobConstants((prev) => ({ ...prev, [key]: next.value }))
  }

  function removeConstant(key: JobConstantKey) {
    if (removedConstantKeys.includes(key)) return
    const previousValue = jobConstants[key]
    setRemovedConstants((prev) => [...prev, { key, previousValue }])
    setJobConstants((prev) => ({ ...prev, [key]: neutralValue(key) }))
    if (editingConstantKey === key) {
      closeConstantEditor()
    }
  }

  function undoRemoveConstant() {
    setRemovedConstants((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setJobConstants((jc) => ({ ...jc, [last.key]: last.previousValue }))
      return prev.slice(0, -1)
    })
  }

  return {
    jobConstants,
    constantChips: constantChips.filter((chip) => !removedConstantKeys.includes(chip.key)),
    canUndoRemove: removedConstants.length > 0,
    editingConstant,
    editingConstantValue,
    editConstantError,
    setEditingConstantValue,
    openConstantEditor,
    cycleConstant,
    closeConstantEditor,
    saveConstant,
    removeConstant,
    undoRemoveConstant,
    difficultyLabel: (() => {
      const rawValue = jobConstants.difficulty_multiplier_percent
      const level = DIFFICULTY_LEVELS.find((l) => l.value === rawValue) ?? DIFFICULTY_LEVELS[0]
      return `${t.newQuote.difficultyLevels[level.labelKey]} ${level.multiplier}`
    })(),
  }
}
