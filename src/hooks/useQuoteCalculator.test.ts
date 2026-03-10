import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { calculate3DPrintPrice, useQuoteCalculator } from '@/hooks/useQuoteCalculator'

describe('useQuoteCalculator', () => {
  it('starts with empty items and zero totals', () => {
    const { result } = renderHook(() => useQuoteCalculator())
    expect(result.current.items).toHaveLength(0)
    expect(result.current.subtotal).toBe(0)
    expect(result.current.total).toBe(0)
  })

  it('adds a blank item', () => {
    const { result } = renderHook(() => useQuoteCalculator())
    act(() => result.current.addItem())
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].description).toBe('')
    expect(result.current.items[0].quantity).toBe(1)
    expect(result.current.items[0].unit_price).toBe(0)
  })

  it('calculates subtotal when item is updated', () => {
    const { result } = renderHook(() => useQuoteCalculator())
    act(() => result.current.addItem())
    const tempId = result.current.items[0].tempId

    act(() => result.current.updateItem(tempId, 'quantity', 3))
    act(() => result.current.updateItem(tempId, 'unit_price', 50))

    expect(result.current.items[0].subtotal).toBe(150)
    expect(result.current.subtotal).toBe(150)
  })

  it('applies tax rate correctly', () => {
    const { result } = renderHook(() => useQuoteCalculator())
    act(() => result.current.addItem())
    const tempId = result.current.items[0].tempId
    act(() => result.current.updateItem(tempId, 'quantity', 1))
    act(() => result.current.updateItem(tempId, 'unit_price', 100))
    act(() => result.current.setTaxRate(20))

    expect(result.current.subtotal).toBe(100)
    expect(result.current.taxAmount).toBe(20)
    expect(result.current.total).toBe(120)
  })

  it('removes an item', () => {
    const { result } = renderHook(() => useQuoteCalculator())
    act(() => result.current.addItem())
    act(() => result.current.addItem())
    const tempId = result.current.items[0].tempId

    act(() => result.current.removeItem(tempId))
    expect(result.current.items).toHaveLength(1)
  })

  it('sums multiple items correctly', () => {
    const { result } = renderHook(() => useQuoteCalculator())
    act(() => result.current.addItem())
    act(() => result.current.addItem())
    const [a, b] = result.current.items.map((i) => i.tempId)

    act(() => result.current.updateItem(a, 'quantity', 2))
    act(() => result.current.updateItem(a, 'unit_price', 10))
    act(() => result.current.updateItem(b, 'quantity', 5))
    act(() => result.current.updateItem(b, 'unit_price', 20))

    expect(result.current.subtotal).toBe(120) // 20 + 100
  })

  it('upserts an item by tempId', () => {
    const { result } = renderHook(() => useQuoteCalculator())

    act(() =>
      result.current.upsertItem({
        tempId: 'calc-item',
        description: '3D print job',
        quantity: 1,
        unit_price: 50,
        sort_order: 0,
      }),
    )

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].subtotal).toBe(50)

    act(() =>
      result.current.upsertItem({
        tempId: 'calc-item',
        description: '3D print job',
        quantity: 1,
        unit_price: 80,
        sort_order: 0,
      }),
    )

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].subtotal).toBe(80)
  })

  it('calculates precise 3D print unit price breakdown', () => {
    const breakdown = calculate3DPrintPrice({
      materialWeightGrams: 200,
      materialPricePerKg: 25,
      printTimeHours: 8,
      machineRatePerHour: 5,
      setupTimeHours: 1,
      laborRatePerHour: 20,
      powerConsumptionKw: 0.25,
      electricityRatePerKwh: 0.2,
      postProcessingCost: 3,
      failureRatePercent: 10,
      marginPercent: 30,
    })

    expect(breakdown.materialCost).toBe(5)
    expect(breakdown.machineCost).toBe(40)
    expect(breakdown.laborCost).toBe(20)
    expect(breakdown.energyCost).toBe(0.45)
    expect(breakdown.baseCost).toBe(68.45)
    expect(breakdown.riskCost).toBe(6.85)
    expect(breakdown.marginAmount).toBe(22.59)
    expect(breakdown.unitPrice).toBe(97.88)
  })
})
