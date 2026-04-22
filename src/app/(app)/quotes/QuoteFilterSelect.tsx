'use client'

import { useRouter } from 'next/navigation'
import styles from './quotes.module.css'

interface Props {
  value: string
  options: { value: string; label: string }[]
  ariaLabel: string
}

export function QuoteFilterSelect({ value, options, ariaLabel }: Props) {
  const router = useRouter()

  return (
    <div className={styles.filterSelectWrap}>
      <select
        name="status"
        className={styles.filterSelect}
        defaultValue={value}
        aria-label={ariaLabel}
        onChange={(e) => {
          const v = e.target.value
          router.push(v ? `/quotes?status=${v}` : '/quotes')
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
