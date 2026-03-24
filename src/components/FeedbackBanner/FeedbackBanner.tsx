'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Props {
  message?: string
  status?: string
  baseClass: string
  successClass: string
  errorClass: string
}

export function FeedbackBanner({ message, status, baseClass, successClass, errorClass }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(!!message)

  useEffect(() => {
    if (!message) return

    const params = new URLSearchParams(searchParams.toString())
    params.delete('status')
    params.delete('message')
    const cleanUrl = params.size ? `${pathname}?${params.toString()}` : pathname
    router.replace(cleanUrl, { scroll: false })

    const timer = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(timer)
  }, [message, pathname, router, searchParams])

  if (!visible || !message) return null

  return (
    <p
      role="status"
      aria-live="polite"
      className={`${baseClass} ${status === 'error' ? errorClass : successClass}`}
    >
      {message}
    </p>
  )
}
