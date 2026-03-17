'use client'

import { useState } from 'react'
import { AddressAutocomplete } from './AddressAutocomplete'

interface AddressFieldProps {
  defaultValue?: string
  placeholder?: string
  className?: string
}

export function AddressField({ defaultValue = '', placeholder, className }: AddressFieldProps) {
  const [value, setValue] = useState(defaultValue)

  return (
    <>
      <input type="hidden" name="address" value={value} />
      <AddressAutocomplete
        value={value}
        onChange={setValue}
        onSelect={(s) => setValue(s.formatted)}
        placeholder={placeholder}
        className={className}
      />
    </>
  )
}
