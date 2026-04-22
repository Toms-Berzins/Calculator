'use client'

import styles from './SmartPdfButton.module.css'

interface Props {
  pdfUrl: string
  isDirty: boolean
  isGenerating: boolean
  pdfError: string
  onGenerate: () => void
  labels: {
    generate: string
    download: string
    generating: string
    stale: string
  }
}

export function SmartPdfButton({ pdfUrl, isDirty, isGenerating, pdfError, onGenerate, labels }: Props) {
  // Determine current state
  const isReady = !!pdfUrl && !isDirty && !isGenerating
  const isStale = !!pdfUrl && isDirty && !isGenerating

  if (isGenerating) {
    return (
      <div>
        <button
          type="button"
          disabled
          className={styles.pdfBtn}
          aria-busy="true"
        >
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          {labels.generating}
        </button>
      </div>
    )
  }

  if (isStale) {
    return (
      <div>
        <button
          type="button"
          disabled
          className={`${styles.pdfBtn} ${styles.pdfBtnStale}`}
          title={labels.stale}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {labels.stale}
        </button>
      </div>
    )
  }

  if (isReady) {
    return (
      <div>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className={`${styles.pdfBtn} ${styles.pdfBtnReady}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {labels.download}
        </a>
        {pdfError && <p className={styles.pdfError} role="alert">{pdfError}</p>}
      </div>
    )
  }

  // Default: no PDF yet
  return (
    <div>
      <button
        type="button"
        onClick={onGenerate}
        className={styles.pdfBtn}
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
        </svg>
        {labels.generate}
      </button>
      {pdfError && <p className={styles.pdfError} role="alert">{pdfError}</p>}
    </div>
  )
}
