import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { BulkDiscountTier } from '@/types/database'
import { findMatchingTier, useQuotePricing } from './useQuotePricing'

function createTier(
  overrides: Partial<BulkDiscountTier> &
    Pick<BulkDiscountTier, 'id' | 'min_qty' | 'discount_percent'>,
): BulkDiscountTier {
  return {
    id: overrides.id,
    min_qty: overrides.min_qty,
    max_qty: overrides.max_qty ?? null,
    discount_percent: overrides.discount_percent,
    label: overrides.label ?? null,
    sort_order: overrides.sort_order ?? overrides.id,
    created_at: overrides.created_at ?? '2026-01-01T00:00:00.000Z',
  }
}

const baseInput = {
  partName: 'Widget',
  partQuantity: 1,
  materialWeightGrams: 1000,
  printTimeHours: 0,
  setupTimeHours: 0,
  postProcessingCost: 0,
  subtotal: 0,
  taxRate: 21,
  jobConstants: {
    material_price_per_kg: 10,
    material_overhead_percent: 0,
    machine_rate_per_hour: 0,
    labor_rate_per_hour: 0,
    power_consumption_kw: 0,
    electricity_rate_per_kwh: 0,
    failure_rate_percent: 0,
    margin_percent: 0,
    packaging_cost: 0,
    shipping_cost: 0,
    difficulty_multiplier_percent: 100,
  },
  bulkDiscountTiers: [] as BulkDiscountTier[],
}

describe('findMatchingTier', () => {
  const tiers = [
    createTier({ id: 1, min_qty: 1, max_qty: 9, discount_percent: 5 }),
    createTier({ id: 2, min_qty: 10, max_qty: 19, discount_percent: 10 }),
    createTier({ id: 3, min_qty: 20, max_qty: null, discount_percent: 15 }),
  ]

  it('matches exact min and max quantity boundaries', () => {
    expect(findMatchingTier(tiers, 1)?.id).toBe(1)
    expect(findMatchingTier(tiers, 9)?.id).toBe(1)
    expect(findMatchingTier(tiers, 10)?.id).toBe(2)
    expect(findMatchingTier(tiers, 19)?.id).toBe(2)
  })

  it('matches open-ended tiers when max_qty is null', () => {
    expect(findMatchingTier(tiers, 20)?.id).toBe(3)
    expect(findMatchingTier(tiers, 200)?.id).toBe(3)
  })

  it('returns null when no tier matches the quantity', () => {
    expect(
      findMatchingTier([createTier({ id: 1, min_qty: 5, max_qty: 10, discount_percent: 10 })], 4),
    ).toBeNull()
  })

  it('returns null when multiple tiers overlap for the same quantity', () => {
    const overlappingTiers = [
      createTier({ id: 1, min_qty: 1, max_qty: 10, discount_percent: 5 }),
      createTier({ id: 2, min_qty: 10, max_qty: 20, discount_percent: 10 }),
    ]

    expect(findMatchingTier(overlappingTiers, 10)).toBeNull()
  })
})

describe('useQuotePricing', () => {
  it('applies the matched tier discount to the final calculated unit price', () => {
    const { result } = renderHook(() =>
      useQuotePricing({
        ...baseInput,
        partQuantity: 10,
        bulkDiscountTiers: [createTier({ id: 1, min_qty: 10, max_qty: 20, discount_percent: 15 })],
      }),
    )

    expect(result.current.preDiscountUnitPrice).toBe(10)
    expect(result.current.discountPercent).toBe(15)
    expect(result.current.calculatedUnitPrice).toBe(8.5)
    expect(result.current.discountAmount).toBe(1.5)
  })

  it('keeps the pre-discount price when no tier matches', () => {
    const { result } = renderHook(() =>
      useQuotePricing({
        ...baseInput,
        partQuantity: 4,
        bulkDiscountTiers: [createTier({ id: 1, min_qty: 5, max_qty: 10, discount_percent: 10 })],
      }),
    )

    expect(result.current.matchedTier).toBeNull()
    expect(result.current.discountPercent).toBe(0)
    expect(result.current.calculatedUnitPrice).toBe(10)
  })

  it('ignores out-of-range discount percentages', () => {
    const { result } = renderHook(() =>
      useQuotePricing({
        ...baseInput,
        partQuantity: 10,
        bulkDiscountTiers: [
          createTier({ id: 1, min_qty: 10, max_qty: null, discount_percent: 125 }),
        ],
      }),
    )

    expect(result.current.matchedTier?.id).toBe(1)
    expect(result.current.discountPercent).toBe(0)
    expect(result.current.calculatedUnitPrice).toBe(10)
    expect(result.current.discountAmount).toBe(0)
  })
})
