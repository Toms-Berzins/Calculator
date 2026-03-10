import styles from './NewQuoteForm.module.css'
import type { ConstantChip, JobConstantKey } from './NewQuoteForm.types'

interface JobConstantsEditorState {
  constantChips: ConstantChip[]
  canUndoRemove: boolean
  editingConstant: ConstantChip | null
  editingConstantValue: string
  editConstantError: string
}

interface JobConstantsEditorActions {
  onOpenConstantEditor: (key: JobConstantKey) => void
  onRemoveConstant: (key: JobConstantKey) => void
  onUndoRemoveConstant: () => void
  onCloseConstantEditor: () => void
  onChangeEditingConstantValue: (value: string) => void
  onSaveConstant: () => void
}

interface JobConstantsEditorProps {
  state: JobConstantsEditorState
  actions: JobConstantsEditorActions
}

export function JobConstantsEditor(props: JobConstantsEditorProps) {
  const {
    constantChips,
    canUndoRemove,
    editingConstant,
    editingConstantValue,
    editConstantError,
  } = props.state
  const {
    onOpenConstantEditor,
    onRemoveConstant,
    onUndoRemoveConstant,
    onCloseConstantEditor,
    onChangeEditingConstantValue,
    onSaveConstant,
  } = props.actions
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={`text-base font-semibold ${styles.pageTitle}`}>3D Print Calculator</h2>
          <p className={`mt-1 text-sm ${styles.pageSubtitle}`}>
            Tap a constant bubble to edit it for this job only.
          </p>
        </div>
        <button
          type="button"
          onClick={onUndoRemoveConstant}
          disabled={!canUndoRemove}
          className="btn-ghost inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M8.25 4.5 3.75 9l4.5 4.5v-3h3A3.75 3.75 0 0 1 15 14.25v1.25a.75.75 0 0 0 1.5 0v-1.25A5.25 5.25 0 0 0 11.25 9h-3v-4.5Z" />
          </svg>
          <span>Undo</span>
        </button>
      </div>

      <div className={`mt-3 flex flex-wrap gap-2 ${styles.constantsWrap}`}>
        {constantChips.map((chip) => (
          <div
            key={chip.key}
            className={styles.constantChipWrap}
          >
            <button
              type="button"
              onClick={() => onOpenConstantEditor(chip.key)}
              className={`rounded-full px-4 py-2 text-sm ${styles.constantChipButton}`}
            >
              {chip.label}: {chip.value}
            </button>
            <button
              type="button"
              onClick={() => onRemoveConstant(chip.key)}
              aria-label={`Remove ${chip.label}`}
              className={styles.constantChipRemove}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M5.293 5.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {editingConstant && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={`w-full max-w-md rounded-2xl p-4 ${styles.modalCard}`}>
            <div className="flex items-center justify-between gap-2">
              <h3 className={`text-base font-semibold ${styles.pageTitle}`}>
                Edit {editingConstant.label} for this job
              </h3>
              <button
                type="button"
                aria-label="Close constant editor"
                onClick={onCloseConstantEditor}
                className="btn-ghost rounded-lg px-2 py-1 text-sm"
              >
                ×
              </button>
            </div>

            <p className={`mt-1 text-sm ${styles.pageSubtitle}`}>
              This override applies only to the current quote job.
            </p>

            <label className="mt-3 block text-sm">
              <span className={`mb-1 block ${styles.totalRow}`}>Value</span>
              <input
                type="number"
                min={0}
                step={editingConstant.step}
                value={editingConstantValue}
                onChange={(e) => onChangeEditingConstantValue(e.target.value)}
                className="input-field w-full rounded-lg px-3 py-2 text-sm"
              />
            </label>

            {editConstantError && (
              <p role="alert" className={`mt-2 text-xs ${styles.pageSubtitle}`}>
                {editConstantError}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onCloseConstantEditor}
                className="btn-ghost w-full rounded-lg py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSaveConstant}
                className="btn-primary w-full rounded-lg py-2 text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
