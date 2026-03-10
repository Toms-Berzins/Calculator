'use client'

import { useState } from 'react'
import styles from '@/app/(app)/jobs/jobs.module.css'

interface DeleteJobButtonProps {
  jobId: string
  action: (formData: FormData) => void | Promise<void>
}

export function DeleteJobButton({ jobId, action }: DeleteJobButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className={styles.deleteButton} onClick={() => setOpen(true)}>
        Delete
      </button>

      {open && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Confirm delete job">
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Delete job</h3>
            <p className={styles.modalText}>Enter your password to confirm deletion.</p>

            <form action={action} className={styles.modalForm}>
              <input type="hidden" name="id" value={jobId} />

              <label className="text-sm">
                <span className={styles.fieldLabel}>Password</span>
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
                  Cancel
                </button>
                <button type="submit" className={styles.deleteButton}>Delete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}