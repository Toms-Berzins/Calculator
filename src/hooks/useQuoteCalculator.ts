import { useReducer, useCallback } from 'react'
import type { QuoteItem } from '@/types/database'

export interface LineItem extends Omit<QuoteItem, 'id' | 'quote_id'> {
  tempId: string
}

type Action =
  | { type: 'ADD_ITEM' }
  | { type: 'UPDATE_ITEM'; tempId: string; field: keyof LineItem; value: string | number }
  | { type: 'REMOVE_ITEM'; tempId: string }
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
    loadItems,
  }
}
