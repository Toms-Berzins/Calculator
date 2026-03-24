'use client'

import { useState } from 'react'
import styles from '@/app/(app)/quotes/quotes.module.css'

interface DeleteDraftQuoteButtonLabels {
  trigger: string
  modalTitle: string
  modalDesc: string
  cancel: string
  confirm: string
}

interface DeleteDraftQuoteButtonProps {
  action: (formData: FormData) => void | Promise<void>
  jobTitle: string
  labels: DeleteDraftQuoteButtonLabels
}

export function DeleteDraftQuoteButton({ action, jobTitle, labels }: DeleteDraftQuoteButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={styles.deleteBtn}
        onClick={() => setOpen(true)}
        aria-label={`${labels.trigger} ${jobTitle}`}
        title={labels.trigger}
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label={labels.modalTitle}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>{labels.modalTitle}</h3>
            <p className={styles.modalText}>{labels.modalDesc}</p>
            <form action={action} className={styles.modalForm}>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className="btn-ghost px-4 py-2 text-sm font-semibold"
                  onClick={() => setOpen(false)}
                >
                  {labels.cancel}
                </button>
                <button type="submit" className={styles.deleteBtnConfirm}>
                  {labels.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
