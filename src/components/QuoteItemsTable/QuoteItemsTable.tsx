import type { LineItem } from '@/hooks/useQuoteCalculator'
import { formatCurrency } from '@/lib/utils/format'
import styles from './QuoteItemsTable.module.css'

interface Props {
  items: LineItem[]
  onAdd: () => void
  onRemove: (tempId: string) => void
  onUpdate: (tempId: string, field: keyof LineItem, value: string | number) => void
}

export function QuoteItemsTable({ items, onAdd, onRemove, onUpdate }: Props) {
  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className={`text-left text-xs font-semibold uppercase tracking-wide ${styles.tableHeader}`}
            >
              <th className="pb-2 pr-3">Description</th>
              <th className="pb-2 pr-3 w-20 text-right">Qty</th>
              <th className="pb-2 pr-3 w-28 text-right">Unit Price</th>
              <th className="pb-2 pr-3 w-28 text-right">Subtotal</th>
              <th className="pb-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.tempId} className={styles.tableRow}>
                <td className="py-2 pr-3">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => onUpdate(item.tempId, 'description', e.target.value)}
                    placeholder="Item description"
                    aria-label="Item description"
                    className="input-field w-full rounded-lg px-2 py-1.5 text-sm"
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="number"
                    min={0}
                    step={0.001}
                    value={item.quantity}
                    onChange={(e) => onUpdate(item.tempId, 'quantity', Number(e.target.value))}
                    aria-label="Quantity"
                    className="input-field w-full rounded-lg px-2 py-1.5 text-right text-sm tabular-nums"
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unit_price}
                    onChange={(e) => onUpdate(item.tempId, 'unit_price', Number(e.target.value))}
                    aria-label="Unit price"
                    className="input-field w-full rounded-lg px-2 py-1.5 text-right text-sm tabular-nums"
                  />
                </td>
                <td
                  className={`py-2 pr-3 text-right font-medium tabular-nums ${styles.subtotalCell}`}
                >
                  {formatCurrency(item.subtotal)}
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => onRemove(item.tempId)}
                    aria-label="Remove item"
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-base leading-none ${styles.removeButton}`}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <div
            key={item.tempId}
            className={`rounded-2xl p-3 ${styles.mobileCard}`}
          >
            <input
              type="text"
              value={item.description}
              onChange={(e) => onUpdate(item.tempId, 'description', e.target.value)}
              placeholder="Description"
              aria-label="Item description"
              className="input-field mb-2 w-full rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className={`mb-0.5 block text-xs ${styles.mobileLabel}`}>
                  Qty
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.001}
                  value={item.quantity}
                  onChange={(e) => onUpdate(item.tempId, 'quantity', Number(e.target.value))}
                  aria-label="Quantity"
                  className="input-field w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className={`mb-0.5 block text-xs ${styles.mobileLabel}`}>
                  Unit Price
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.unit_price}
                  onChange={(e) => onUpdate(item.tempId, 'unit_price', Number(e.target.value))}
                  aria-label="Unit price"
                  className="input-field w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1 text-right">
                <label className={`mb-0.5 block text-xs ${styles.mobileLabel}`}>
                  Total
                </label>
                <p
                  className={`py-2 text-sm font-semibold tabular-nums ${styles.subtotalCell}`}
                >
                  {formatCurrency(item.subtotal)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.tempId)}
              className={`mt-2 text-xs font-medium ${styles.removeButtonMobile}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Add line item */}
      <button
        type="button"
        onClick={onAdd}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-medium ${styles.addButton}`}
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Add line item
      </button>
    </div>
  )
}
