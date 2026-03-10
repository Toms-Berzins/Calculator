'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useT } from '@/i18n/context'
import styles from './login.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const t = useT()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
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
        <h1 className="text-2xl font-bold text-white tracking-tight">QuoteCalc</h1>
        <p className={`mt-1 text-sm ${styles.subtitle}`}>
          {t.login.subtitle}
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className={styles.label}
          >
            {t.login.email}
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`block w-full rounded-xl px-4 py-3 text-sm text-white placeholder:opacity-30 focus:outline-none ${styles.input}`}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.8)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            }}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className={styles.label}
          >
            {t.login.password}
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`block w-full rounded-xl px-4 py-3 text-sm text-white placeholder:opacity-30 focus:outline-none ${styles.input}`}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.8)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            }}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className={styles.errorMessage}>
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
