import { useReducer, useCallback } from 'react'
import type { QuoteItem } from '@/types/database'

export interface LineItem extends Omit<QuoteItem, 'id' | 'quote_id'> {
  tempId: string
}

export interface PrintPricingInput {
  materialWeightGrams: number
  materialPricePerKg: number
  /** Extra % added to raw material cost to cover supports, brims, purge lines & waste (default 10) */
  materialOverheadPercent: number
  printTimeHours: number
  machineRatePerHour: number
  setupTimeHours: number
  laborRatePerHour: number
  powerConsumptionKw: number
  electricityRatePerKwh: number
  postProcessingCost: number
  failureRatePercent: number
  /** True profit margin: profit as a % of the final selling price, not markup on cost */
  marginPercent: number
}

export interface PrintPricingBreakdown {
  materialCost: number
  machineCost: number
  laborCost: number
  energyCost: number
  postProcessingCost: number
  baseCost: number
  riskCost: number
  marginAmount: number
  unitPrice: number
}

function toSafeNumber(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, value)
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

export function calculate3DPrintPrice(input: PrintPricingInput): PrintPricingBreakdown {
  const materialWeightKg = toSafeNumber(input.materialWeightGrams) / 1000
  const materialPricePerKg = toSafeNumber(input.materialPricePerKg)
  const materialOverheadPercent = toSafeNumber(input.materialOverheadPercent)
  const printTimeHours = toSafeNumber(input.printTimeHours)
  const machineRatePerHour = toSafeNumber(input.machineRatePerHour)
  const setupTimeHours = toSafeNumber(input.setupTimeHours)
  const laborRatePerHour = toSafeNumber(input.laborRatePerHour)
  const powerConsumptionKw = toSafeNumber(input.powerConsumptionKw)
  const electricityRatePerKwh = toSafeNumber(input.electricityRatePerKwh)
  const postProcessingCost = toSafeNumber(input.postProcessingCost)
  const failureRatePercent = toSafeNumber(input.failureRatePercent)
  const marginPercent = toSafeNumber(input.marginPercent)

  // Material cost includes overhead % for supports, brims, purge lines & waste
  const materialCost = materialWeightKg * materialPricePerKg * (1 + materialOverheadPercent / 100)
  const machineCost = printTimeHours * machineRatePerHour
  const laborCost = setupTimeHours * laborRatePerHour
  const energyCost = (printTimeHours + setupTimeHours) * powerConsumptionKw * electricityRatePerKwh

  const baseCost = materialCost + machineCost + laborCost + energyCost + postProcessingCost
  const riskCost = baseCost * (failureRatePercent / 100)
  const costWithRisk = baseCost + riskCost

  // True profit margin: profit = margin% of the final selling price
  // unitPrice = costWithRisk / (1 - margin%) — capped to avoid division by near-zero
  const clampedMargin = Math.min(Math.max(marginPercent, 0), 99.9)
  const unitPrice = clampedMargin < 0.001 ? costWithRisk : costWithRisk / (1 - clampedMargin / 100)
  const marginAmount = unitPrice - costWithRisk

  return {
    materialCost: roundCurrency(materialCost),
    machineCost: roundCurrency(machineCost),
    laborCost: roundCurrency(laborCost),
    energyCost: roundCurrency(energyCost),
    postProcessingCost: roundCurrency(postProcessingCost),
    baseCost: roundCurrency(baseCost),
    riskCost: roundCurrency(riskCost),
    marginAmount: roundCurrency(marginAmount),
    unitPrice: roundCurrency(unitPrice),
  }
}

type Action =
  | { type: 'ADD_ITEM' }
  | { type: 'UPDATE_ITEM'; tempId: string; field: keyof LineItem; value: string | number }
  | { type: 'REMOVE_ITEM'; tempId: string }
  | {
      type: 'UPSERT_ITEM'
      item: Omit<LineItem, 'subtotal'>
    }
  | { type: 'SET_TAX_RATE'; value: number }
  | { type: 'LOAD_ITEMS'; items: LineItem[]; taxRate: number }

interface State {
  items: LineItem[]
  taxRate: number
}

function recalc(item: Omit<LineItem, 'subtotal'>): LineItem {
  return { ...item, subtotal: Number(item.quantity) * Number(item.unit_price) }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [
          ...state.items,
          recalc({
            tempId: crypto.randomUUID(),
            description: '',
            quantity: 1,
            unit_price: 0,
            sort_order: state.items.length,
          }),
        ],
      }

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.tempId === action.tempId
            ? recalc({ ...item, [action.field]: action.value })
            : item,
        ),
      }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.tempId !== action.tempId),
      }

    case 'UPSERT_ITEM': {
      const nextItem = recalc(action.item)
      const existingIndex = state.items.findIndex((item) => item.tempId === action.item.tempId)

      if (existingIndex === -1) {
        return {
          ...state,
          items: [...state.items, nextItem],
        }
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.tempId === nextItem.tempId ? nextItem : item,
        ),
      }
    }

    case 'SET_TAX_RATE':
      return { ...state, taxRate: action.value }

    case 'LOAD_ITEMS':
      return { items: action.items, taxRate: action.taxRate }

    default:
      return state
  }
}

export function useQuoteCalculator(initialItems: LineItem[] = [], initialTaxRate = 0) {
  const [state, dispatch] = useReducer(reducer, {
    items: initialItems,
    taxRate: initialTaxRate,
  })

  const subtotal = state.items.reduce((sum, i) => sum + i.subtotal, 0)
  const taxAmount = subtotal * (state.taxRate / 100)
  const total = subtotal + taxAmount

  const addItem = useCallback(() => dispatch({ type: 'ADD_ITEM' }), [])
  const removeItem = useCallback(
    (tempId: string) => dispatch({ type: 'REMOVE_ITEM', tempId }),
    [],
  )
  const updateItem = useCallback(
    (tempId: string, field: keyof LineItem, value: string | number) =>
      dispatch({ type: 'UPDATE_ITEM', tempId, field, value }),
    [],
  )
  const setTaxRate = useCallback(
    (value: number) => dispatch({ type: 'SET_TAX_RATE', value }),
    [],
  )
  const upsertItem = useCallback(
    (item: Omit<LineItem, 'subtotal'>) => dispatch({ type: 'UPSERT_ITEM', item }),
    [],
  )
  const loadItems = useCallback(
    (items: LineItem[], taxRate: number) => dispatch({ type: 'LOAD_ITEMS', items, taxRate }),
    [],
  )

  return {
    items: state.items,
    taxRate: state.taxRate,
    subtotal,
    taxAmount,
    total,
    addItem,
    removeItem,
    updateItem,
    setTaxRate,
    upsertItem,
    loadItems,
  }
}
