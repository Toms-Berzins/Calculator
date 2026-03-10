'use client'

import { useState } from 'react'
import styles from '@/app/(app)/jobs/jobs.module.css'

export interface DeleteJobButtonLabels {
  trigger: string
  modalTitle: string
  modalDesc: string
  passwordLabel: string
  cancel: string
  confirm: string
}

interface DeleteJobButtonProps {
  jobId: string
  action: (formData: FormData) => void | Promise<void>
  labels: DeleteJobButtonLabels
}

export function DeleteJobButton({ jobId, action, labels }: DeleteJobButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className={styles.deleteButton} onClick={() => setOpen(true)} aria-label={labels.modalTitle}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {labels.trigger}
      </button>

      {open && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label={labels.modalTitle}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>{labels.modalTitle}</h3>
            <p className={styles.modalText}>{labels.modalDesc}</p>

            <form action={action} className={styles.modalForm}>
              <input type="hidden" name="id" value={jobId} />

              <label className="text-sm">
                <span className={styles.fieldLabel}>{labels.passwordLabel}</span>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="input-field w-full rounded-lg px-3 py-2 text-sm"
                  placeholder="••••••••"
                />
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className="btn-ghost rounded-lg px-4 py-2 text-sm font-semibold"
                  onClick={() => setOpen(false)}
                >
                  {labels.cancel}
                </button>
                <button type="submit" className={styles.deleteButton}>{labels.confirm}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}