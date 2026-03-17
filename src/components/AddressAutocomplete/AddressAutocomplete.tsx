'use client'

import { useEffect, useId, useRef, useState } from 'react'
import styles from './AddressAutocomplete.module.css'

export interface AddressSuggestion {
  formatted: string
  street: string | null
  city: string | null
  postcode: string | null
  country: string | null
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (suggestion: AddressSuggestion) => void
  placeholder?: string
  className?: string
}

export function AddressAutocomplete({ value, onChange, onSelect, placeholder, className }: AddressAutocompleteProps) {
  const uid = useId()
  const listboxId = `addr-listbox-${uid}`
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/address-search?text=${encodeURIComponent(value)}`)
        if (res.ok) {
          const data = (await res.json()) as AddressSuggestion[]
          setSuggestions(data)
          setOpen(data.length > 0)
          setActiveIndex(-1)
        }
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [value])

  // Close on outside click
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function handleSelect(suggestion: AddressSuggestion) {
    onChange(suggestion.formatted)
    setSuggestions([])
    setOpen(false)
    onSelect(suggestion)
    inputRef.current?.blur()
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        role="combobox"
        aria-expanded={open ? 'true' : 'false'}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
      />
      {loading && (
        <span aria-live="polite" className={styles.loadingIndicator}>
          …
        </span>
      )}
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Address suggestions"
          className={styles.dropdown}
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex ? 'true' : 'false'}
              className={`${styles.option}${i === activeIndex ? ` ${styles.optionActive}` : ''}`}
              onPointerDown={(e) => {
                e.preventDefault()
                handleSelect(s)
              }}
              onPointerEnter={() => setActiveIndex(i)}
            >
              {s.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
