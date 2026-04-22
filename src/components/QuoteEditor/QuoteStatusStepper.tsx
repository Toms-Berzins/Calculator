'use client'

import type { QuoteStatus } from '@/types/database'
import styles from './QuoteStatusStepper.module.css'

interface Props {
  status: QuoteStatus
  onChange: (next: QuoteStatus) => void
  label?: string
}

const STATUS_ORDER: QuoteStatus[] = ['draft', 'sent', 'accepted', 'rejected']

function getStepClass(step: QuoteStatus, current: QuoteStatus): string {
  const classes = [styles.step]

  const stepIndex = STATUS_ORDER.indexOf(step)
  const currentIndex = STATUS_ORDER.indexOf(current)

  if (step === current) {
    classes.push(styles.stepActive)
  } else if (stepIndex < currentIndex && step !== 'rejected' && step !== 'accepted') {
    classes.push(styles.stepDone)
  }

  // Status color class
  if (step === 'draft') classes.push(styles.stepDraft)
  else if (step === 'sent') classes.push(styles.stepSent)
  else if (step === 'accepted') classes.push(styles.stepAccepted)
  else if (step === 'rejected') classes.push(styles.stepRejected)

  return classes.join(' ')
}

export function QuoteStatusStepper({ status, onChange, label = 'Quote status' }: Props) {
  return (
    <nav
      role="group"
      aria-label={label}
      className={styles.stepper}
    >
      {/* Draft */}
      <button
        type="button"
        className={getStepClass('draft', status)}
        aria-current={status === 'draft' ? 'step' : undefined}
        onClick={() => status !== 'draft' && onChange('draft')}
      >
        <span className={styles.stepDot} aria-hidden />
        Draft
      </button>

      {/* Sent */}
      <button
        type="button"
        className={getStepClass('sent', status)}
        aria-current={status === 'sent' ? 'step' : undefined}
        onClick={() => status !== 'sent' && onChange('sent')}
      >
        <span className={styles.stepDot} aria-hidden />
        Sent
      </button>

      {/* Branch: Accepted / Rejected */}
      <div className={styles.branchGroup}>
        <button
          type="button"
          className={getStepClass('accepted', status)}
          aria-current={status === 'accepted' ? 'step' : undefined}
          onClick={() => status !== 'accepted' && onChange('accepted')}
        >
          <span className={styles.stepDot} aria-hidden />
          Accepted
        </button>
        <button
          type="button"
          className={getStepClass('rejected', status)}
          aria-current={status === 'rejected' ? 'step' : undefined}
          onClick={() => status !== 'rejected' && onChange('rejected')}
        >
          <span className={styles.stepDot} aria-hidden />
          Rejected
        </button>
      </div>
    </nav>
  )
}
