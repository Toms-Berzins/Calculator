'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { isEuCaptchaDone } from '@myrasec/eu-captcha'

const EuCaptcha = dynamic(
  () => import('@myrasec/eu-captcha').then((m) => m.EuCaptcha),
  { ssr: false }
)
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useT } from '@/i18n/context'
import styles from './login.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const captchaToken = useRef<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const t = useT()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isEuCaptchaDone() || !captchaToken.current) {
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

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      captchaToken.current = null
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className={styles.loginCard}>
      {/* Brand */}
      <div className="mb-8 text-center">
        <div className={styles.brandIconContainer}>
          Q
        </div>
        <h1 className={styles.brandTitle}>QuoteCalc</h1>
        <p className={styles.subtitle}>
          {t.login.subtitle}
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className={styles.label}>
            {t.login.email}
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

        <div>
          <div className={styles.passwordLabelRow}>
            <label htmlFor="password" className={styles.label}>
              {t.login.password}
            </label>
            <Link href="/forgot-password" className={styles.forgotLink}>
              {t.login.forgotPassword ?? 'Forgot password?'}
            </Link>
          </div>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={styles.showPasswordToggle}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <EuCaptcha
          sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY!}
          onComplete={(token: string) => { captchaToken.current = token }}
          onExpired={() => { captchaToken.current = null }}
          onError={() => { captchaToken.current = null }}
        />

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
          {loading ? t.login.signingIn : t.login.signIn}
        </button>
      </form>
    </div>
  )
}
