import type { LineItem } from '@/hooks/useQuoteCalculator'
import { formatCurrency } from '@/lib/utils/format'
import { useT } from '@/i18n/context'
import styles from './QuoteItemsTable.module.css'

interface Props {
  items: LineItem[]
  onAdd: () => void
  onRemove: (tempId: string) => void
  onUpdate: (tempId: string, field: keyof LineItem, value: string | number) => void
}

export function QuoteItemsTable({ items, onAdd, onRemove, onUpdate }: Props) {
  const t = useT()
  return (
    <div className={styles.root}>
      {/* Desktop table */}
      <div className={`hidden md:block ${styles.desktopWrap}`}>
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr
              className={`text-left text-xs font-semibold uppercase tracking-wide ${styles.tableHeader}`}
            >
              <th className="px-3 py-3">{t.table.description}</th>
              <th className="w-24 px-3 py-3 text-right">{t.table.qty}</th>
              <th className="w-32 px-3 py-3 text-right">{t.table.unitPrice}</th>
              <th className="w-32 px-3 py-3 text-right">{t.table.subtotal}</th>
              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.tempId} className={styles.tableRow}>
                <td className="px-3 py-2.5">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => onUpdate(item.tempId, 'description', e.target.value)}
                    placeholder={t.table.itemDescriptionPlaceholder}
                    aria-label={t.table.itemDescriptionPlaceholder}
                    className="input-field w-full rounded-lg px-3 py-2 text-sm"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    min={0}
                    step={0.001}
                    value={item.quantity}
                    onChange={(e) => onUpdate(item.tempId, 'quantity', Number(e.target.value))}
                    aria-label={t.table.qty}
                    className="input-field w-full rounded-lg px-3 py-2 text-right text-sm tabular-nums"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unit_price}
                    onChange={(e) => onUpdate(item.tempId, 'unit_price', Number(e.target.value))}
                    aria-label={t.table.unitPrice}
                    className="input-field w-full rounded-lg px-3 py-2 text-right text-sm tabular-nums"
                  />
                </td>
                <td
                  className={`px-3 py-2.5 text-right text-sm font-semibold tabular-nums ${styles.subtotalCell}`}
                >
                  {formatCurrency(item.subtotal)}
                </td>
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => onRemove(item.tempId)}
                    aria-label={t.table.removeItem}
                    className={styles.removeButton}
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
              placeholder={t.table.itemDescriptionPlaceholder}
              aria-label={t.table.itemDescriptionPlaceholder}
              className="input-field mb-2 w-full rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className={`mb-0.5 block text-xs ${styles.mobileLabel}`}>
                  {t.table.qtyShort}
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
                  {t.table.unitPriceShort}
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
                  {t.table.totalShort}
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
              {t.table.remove}
            </button>
          </div>
        ))}
      </div>

      {/* Add line item */}
      <button
        type="button"
        onClick={onAdd}
        className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-semibold ${styles.addButton}`}
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        {t.table.addItem}
      </button>
    </div>
  )
}
