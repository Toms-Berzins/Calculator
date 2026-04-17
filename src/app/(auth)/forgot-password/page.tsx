'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useT } from '@/i18n/context'
import styles from '../login/login.module.css'

declare global {
  interface Window {
    onForgotCaptchaComplete?: (token: string) => void
    onForgotCaptchaExpired?: () => void
    onForgotCaptchaError?: () => void
  }
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const captchaToken = useRef<string | null>(null)
  const supabase = createBrowserSupabaseClient()
  const t = useT()

  useEffect(() => {
    window.onForgotCaptchaComplete = (token: string) => { captchaToken.current = token }
    window.onForgotCaptchaExpired = () => { captchaToken.current = null }
    window.onForgotCaptchaError = () => { captchaToken.current = null }
    return () => {
      delete window.onForgotCaptchaComplete
      delete window.onForgotCaptchaExpired
      delete window.onForgotCaptchaError
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!captchaToken.current) {
      setError('Please complete the CAPTCHA.')
      return
    }

    setLoading(true)

    const verifyRes = await fetch('/api/captcha/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: captchaToken.current }),
    })

    if (!verifyRes.ok) {
      setError('CAPTCHA verification failed. Please try again.')
      setLoading(false)
      captchaToken.current = null
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      captchaToken.current = null
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <>
      <Script
        src="https://cdn.eu-captcha.eu/verify.js"
        strategy="lazyOnload"
      />
      <div className={styles.loginCard}>
        <div className="mb-8 text-center">
          <div className={styles.brandIconContainer}>Q</div>
          <h1 className={styles.brandTitle}>QuoteCalc</h1>
          <p className={styles.subtitle}>Reset your password</p>
        </div>

        {sent ? (
          <div>
            <p role="status" aria-live="polite" className={styles.successMessage}>
              Check your email — a reset link has been sent to {email}.
            </p>
            <Link href="/login" className="btn-primary mt-4 block w-full py-3 text-center text-sm">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className={styles.label}>Email</label>
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

            <div
              className="eu-captcha"
              data-sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}
              data-callback="onForgotCaptchaComplete"
              data-expired-callback="onForgotCaptchaExpired"
              data-error-callback="onForgotCaptchaError"
            />

            {error && (
              <p className={styles.errorMessage} role="alert" aria-live="assertive">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>

            <p className={styles.backLink}>
              <Link href="/login" className={styles.forgotLink}>
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </>
  )
}
