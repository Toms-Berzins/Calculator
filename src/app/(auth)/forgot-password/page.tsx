'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useT } from '@/i18n/context'
import styles from '../login/login.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserSupabaseClient()
  const t = useT()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className={styles.loginCard}>
      {/* Brand */}
      <div className="mb-8 text-center">
        <div className={styles.brandIconContainer}>Q</div>
        <h1 className={styles.brandTitle}>QuoteCalc</h1>
        <p className={styles.subtitle}>Reset your password</p>
      </div>

      {sent ? (
        <div>
          <p
            role="status"
            aria-live="polite"
            className={styles.errorMessage}
            style={{ background: 'var(--status-accepted-bg)', borderColor: 'var(--status-accepted-text)', color: 'var(--status-accepted-text)', boxShadow: '2px 2px 0 var(--status-accepted-text)' }}
          >
            Check your email — a reset link has been sent to {email}.
          </p>
          <Link href="/login" className="btn-primary mt-4 block w-full py-3 text-center text-sm">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <p className={styles.errorMessage} role="alert" aria-live="assertive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>

          <p className="text-center" style={{ fontSize: '0.75rem' }}>
            <Link href="/login" className={styles.forgotLink}>
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}
